import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  GameMode,
  GameState,
  LevelDefinition,
  LevelProgress,
  PlayerStats,
  Screen,
  ThemeName,
  AchievementState,
} from '@/types/game';
import { THEMES } from '@/types/game';
import { shuffleBoard, makeMove, getHint, autoSolveMoves, computeStars } from '@/lib/gameLogic';
import { LEVELS, loadSave, saveSave, SHOP_ITEMS } from '@/lib/storage';
import { ACHIEVEMENTS } from '@/lib/storage';
import { useSound } from '@/hooks/useSound';
import { useTelegram } from '@/hooks/useTelegram';
import { MainMenu } from '@/components/MainMenu';
import { ModeSelect } from '@/components/ModeSelect';
import { LevelSelect } from '@/components/LevelSelect';
import { GameBoard } from '@/components/GameBoard';
import { WinModal } from '@/components/WinModal';
import { Shop } from '@/components/Shop';
import { Achievements } from '@/components/Achievements';
import { StatsScreen } from '@/components/StatsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { HowToPlay } from '@/components/HowToPlay';
import { Particles } from '@/components/Particles';
import { HeaderBar } from '@/components/HeaderBar';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeLevel, setActiveLevel] = useState<LevelDefinition | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [winStars, setWinStars] = useState(0);
  const [particles, setParticles] = useState(false);
  const [hintTile, setHintTile] = useState<number | null>(null);
  const [magicPath, setMagicPath] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [stats, setStats] = useState<PlayerStats>({
    totalGames: 0,
    totalWins: 0,
    totalMoves: 0,
    bestTime: null,
    bestMoves: null,
    currentStreak: 0,
    bestStreak: 0,
    crystals: 0,
    hintsUsed: 0,
    magicsUsed: 0,
    shufflesUsed: 0,
    theme: 'neon',
    soundEnabled: true,
    musicEnabled: false,
  });
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [ownedThemes, setOwnedThemes] = useState<ThemeName[]>(['neon']);
  const [inventory, setInventory] = useState({ hints: 0, magics: 0, shuffles: 0 });

  const sound = useSound();
  const tg = useTelegram();
  const theme = THEMES[stats.theme];

  // Load save
  useEffect(() => {
    const data = loadSave();
    setLevels(data.levels);
    setStats(data.stats);
    setAchievements(data.achievements);
    // derive owned themes
    const ot: ThemeName[] = ['neon'];
    try {
      const raw = localStorage.getItem('puzzleverse_themes');
      if (raw) ot.push(...(JSON.parse(raw) as ThemeName[]));
    } catch {}
    setOwnedThemes(ot);
    // inventory
    try {
      const raw = localStorage.getItem('puzzleverse_inventory');
      if (raw) setInventory(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    sound.setEnabled(stats.soundEnabled);
  }, [stats.soundEnabled, sound]);

  // Save on change
  useEffect(() => {
    if (levels.length) {
      saveSave({ levels, stats, achievements });
    }
  }, [levels, stats, achievements]);

  useEffect(() => {
    localStorage.setItem('puzzleverse_themes', JSON.stringify(ownedThemes));
  }, [ownedThemes]);

  useEffect(() => {
    localStorage.setItem('puzzleverse_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Timer
  useEffect(() => {
    if (gameState && !gameState.won && gameState.started) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.won) return prev;
          const nextTimer = prev.timer + 1;
          // time limit check
          if (activeLevel?.timeLimit && nextTimer >= activeLevel.timeLimit) {
            // lost
            return { ...prev, won: false, started: false };
          }
          return { ...prev, timer: nextTimer };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.started, gameState?.won, activeLevel?.timeLimit]);

  const navigate = useCallback(
    (s: Screen) => {
      setScreen(s);
      sound.click();
      if (s === 'game') {
        tg.setBackButton(() => {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState(null);
          setActiveLevel(null);
          setShowWin(false);
          setHintTile(null);
          tg.hideMainButton();
          setScreen('levelSelect');
        });
      } else {
        tg.hideBackButton();
        tg.hideMainButton();
      }
    },
    [sound, tg]
  );

  const startLevel = useCallback(
    (lvl: LevelDefinition) => {
      const tiles = shuffleBoard(lvl.size);
      const state: GameState = {
        tiles,
        emptyIndex: tiles.indexOf(0),
        moves: 0,
        timer: 0,
        started: false,
        won: false,
        activeLevel: lvl,
      };
      setActiveLevel(lvl);
      setGameState(state);
      setShowWin(false);
      setWinStars(0);
      setParticles(false);
      setHintTile(null);
      setMagicPath([]);
      setStats((prev) => ({ ...prev, totalGames: prev.totalGames + 1 }));
      navigate('game');

      tg.setMainButton('Перемешать', () => handleShuffle(state), true);
    },
    [navigate, tg]
  );

  const handleShuffle = useCallback(
    (base?: GameState) => {
      const current = base ?? gameState;
      if (!current || !activeLevel) return;
      if (inventory.shuffles <= 0) {
        sound.error();
        return;
      }
      const tiles = shuffleBoard(activeLevel.size);
      setGameState({ ...current, tiles, emptyIndex: tiles.indexOf(0), moves: current.moves, started: current.started, won: false });
      setInventory((prev) => ({ ...prev, shuffles: prev.shuffles - 1 }));
      setStats((prev) => ({ ...prev, shufflesUsed: prev.shufflesUsed + 1 }));
      sound.click();
    },
    [gameState, activeLevel, inventory.shuffles, sound]
  );

  const handleTileClick = useCallback(
    (index: number) => {
      if (!gameState) return;
      const next = makeMove(gameState, index);
      if (!next) {
        sound.error();
        tg.haptic('rigid');
        return;
      }
      sound.move();
      tg.haptic('light');
      setGameState(next);
      setStats((prev) => ({ ...prev, totalMoves: prev.totalMoves + 1 }));
      if (next.won) {
        handleWin(next);
      }
    },
    [gameState, sound, tg]
  );

  const handleWin = useCallback(
    (state: GameState) => {
      if (!activeLevel) return;
      if (timerRef.current) clearInterval(timerRef.current);
      const stars = computeStars(activeLevel, state.moves, state.timer);
      setWinStars(stars);
      setShowWin(true);
      setParticles(true);
      sound.win();
      tg.hapticSuccess();

      // Update progress
      setLevels((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((l) => l.id === activeLevel.id);
        if (idx !== -1) {
          copy[idx] = {
            ...copy[idx],
            completed: true,
            stars: Math.max(copy[idx].stars, stars),
            bestMoves:
              copy[idx].bestMoves === null
                ? state.moves
                : Math.min(copy[idx].bestMoves!, state.moves),
            bestTime:
              copy[idx].bestTime === null
                ? state.timer
                : Math.min(copy[idx].bestTime!, state.timer),
          };
        }
        // Unlock next
        const nextId = activeLevel.id + 1;
        const nextIdx = copy.findIndex((l) => l.id === nextId);
        if (nextIdx !== -1) {
          copy[nextIdx] = { ...copy[nextIdx], unlocked: true };
        }
        return copy;
      });

      setStats((prev) => {
        const newStreak = prev.currentStreak + 1;
        const reward = stars * 5 + 10; // crystals
        return {
          ...prev,
          totalWins: prev.totalWins + 1,
          bestTime:
            prev.bestTime === null ? state.timer : Math.min(prev.bestTime, state.timer),
          bestMoves:
            prev.bestMoves === null ? state.moves : Math.min(prev.bestMoves, state.moves),
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          crystals: prev.crystals + reward,
        };
      });
    },
    [activeLevel, sound, tg]
  );

  const handleHint = useCallback(() => {
    if (!gameState || gameState.won) return;
    if (inventory.hints <= 0) {
      sound.error();
      return;
    }
    const tile = getHint(gameState);
    if (tile !== null) {
      setHintTile(tile);
      setTimeout(() => setHintTile(null), 1200);
      setInventory((prev) => ({ ...prev, hints: prev.hints - 1 }));
      setStats((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      sound.click();
    }
  }, [gameState, inventory.hints, sound]);

  const handleMagic = useCallback(() => {
    if (!gameState || gameState.won) return;
    if (inventory.magics <= 0) {
      sound.error();
      return;
    }
    const path = autoSolveMoves(gameState);
    if (path.length) {
      setMagicPath(path);
      setInventory((prev) => ({ ...prev, magics: prev.magics - 1 }));
      setStats((prev) => ({ ...prev, magicsUsed: prev.magicsUsed + 1 }));
      sound.click();
      // auto-play moves with delay
      let step = 0;
      const interval = setInterval(() => {
        if (step >= path.length) {
          clearInterval(interval);
          setMagicPath([]);
          return;
        }
        setGameState((prev) => {
          if (!prev) return prev;
          const next = makeMove(prev, path[step]);
          if (!next) {
            clearInterval(interval);
            return prev;
          }
          step++;
          sound.move();
          if (next.won) {
            clearInterval(interval);
            handleWin(next);
          }
          return next;
        });
      }, 300);
    }
  }, [gameState, inventory.magics, sound, handleWin]);

  // Achievements checker
  useEffect(() => {
    if (!achievements.length) return;
    const updated = achievements.map((a) => {
      if (a.unlocked) return a;
      const def = ACHIEVEMENTS.find((d) => d.id === a.id);
      if (!def) return a;
      if (def.condition(stats, levels)) {
        return { ...a, unlocked: true };
      }
      return a;
    });
    const changed = updated.some((a, i) => a.unlocked !== achievements[i].unlocked);
    if (changed) {
      setAchievements(updated);
      sound.star();
    }
  }, [stats, levels]);

  const handleClaimAchievement = useCallback(
    (id: string) => {
      const ach = achievements.find((a) => a.id === id);
      if (!ach || !ach.unlocked || ach.claimed) return;
      const def = ACHIEVEMENTS.find((d) => d.id === id);
      if (!def) return;
      setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, claimed: true } : a)));
      setStats((prev) => ({ ...prev, crystals: prev.crystals + def.reward }));
      sound.buy();
    },
    [achievements, sound]
  );

  const handleBuy = useCallback(
    (itemId: string) => {
      const item = SHOP_ITEMS.find((i) => i.id === itemId);
      if (!item) return;
      if (stats.crystals < item.cost) {
        sound.error();
        return;
      }
      if (item.type === 'theme') {
        if (ownedThemes.includes(item.target!)) {
          sound.error();
          return;
        }
        setOwnedThemes((prev) => [...prev, item.target!]);
        setStats((prev) => ({ ...prev, crystals: prev.crystals - item.cost }));
        sound.buy();
        return;
      }
      setStats((prev) => ({ ...prev, crystals: prev.crystals - item.cost }));
      setInventory((prev) => {
        const next = { ...prev };
        if (item.type === 'hint') next.hints += 5;
        if (item.type === 'magic') next.magics += 3;
        if (item.type === 'shuffle') next.shuffles += 5;
        return next;
      });
      sound.buy();
    },
    [stats.crystals, ownedThemes, sound]
  );

  const filteredLevels = useMemo(
    () => LEVELS.filter((l) => l.mode === selectedMode),
    [selectedMode]
  );

  const levelMap = useMemo(() => {
    const map = new Map<number, LevelProgress>();
    levels.forEach((l) => map.set(l.id, l));
    return map;
  }, [levels]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white overflow-hidden relative`}>
      {particles && <Particles />}
      <HeaderBar
        stats={stats}
        onShop={() => navigate('shop')}
        onStats={() => navigate('stats')}
        onSettings={() => navigate('settings')}
      />
      <main className="px-4 pt-2 pb-24 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {screen === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <MainMenu
                onPlay={() => navigate('modeSelect')}
                onHowToPlay={() => navigate('howToPlay')}
                onAchievements={() => navigate('achievements')}
              />
            </motion.div>
          )}
          {screen === 'modeSelect' && (
            <motion.div key="modeSelect" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <ModeSelect
                onSelect={(mode) => {
                  setSelectedMode(mode);
                  navigate('levelSelect');
                }}
                onBack={() => navigate('menu')}
              />
            </motion.div>
          )}
          {screen === 'levelSelect' && (
            <motion.div key="levelSelect" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <LevelSelect
                levels={filteredLevels}
                progress={levelMap}
                onSelect={startLevel}
                onBack={() => navigate('modeSelect')}
              />
            </motion.div>
          )}
          {screen === 'game' && gameState && activeLevel && (
            <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <GameBoard
                state={gameState}
                level={activeLevel}
                theme={theme}
                hintTile={hintTile}
                magicPath={magicPath}
                inventory={inventory}
                onTileClick={handleTileClick}
                onShuffle={() => handleShuffle()}
                onHint={handleHint}
                onMagic={handleMagic}
                stats={stats}
              />
            </motion.div>
          )}
          {screen === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Shop
                stats={stats}
                inventory={inventory}
                ownedThemes={ownedThemes}
                onBuy={handleBuy}
                onBack={() => navigate('menu')}
                theme={theme}
              />
            </motion.div>
          )}
          {screen === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Achievements
                achievements={achievements}
                onClaim={handleClaimAchievement}
                onBack={() => navigate('menu')}
              />
            </motion.div>
          )}
          {screen === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <StatsScreen stats={stats} levels={levels} onBack={() => navigate('menu')} />
            </motion.div>
          )}
          {screen === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SettingsScreen
                stats={stats}
                ownedThemes={ownedThemes}
                onChangeTheme={(t) => setStats((prev) => ({ ...prev, theme: t }))}
                onToggleSound={(v) => setStats((prev) => ({ ...prev, soundEnabled: v }))}
                onToggleMusic={(v) => setStats((prev) => ({ ...prev, musicEnabled: v }))}
                onReset={() => {
                  localStorage.removeItem('puzzleverse_save_v1');
                  localStorage.removeItem('puzzleverse_themes');
                  localStorage.removeItem('puzzleverse_inventory');
                  window.location.reload();
                }}
                onBack={() => navigate('menu')}
                theme={theme}
              />
            </motion.div>
          )}
          {screen === 'howToPlay' && (
            <motion.div key="howToPlay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <HowToPlay onBack={() => navigate('menu')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showWin && gameState && activeLevel && (
        <WinModal
          stars={winStars}
          moves={gameState.moves}
          time={gameState.timer}
          level={activeLevel}
          theme={theme}
          onNext={() => {
            const next = LEVELS.find((l) => l.id === activeLevel.id + 1);
            if (next && levels.find((lv) => lv.id === next.id)?.unlocked) {
              setShowWin(false);
              startLevel(next);
            } else {
              setShowWin(false);
              navigate('levelSelect');
            }
          }}
          onMenu={() => {
            setShowWin(false);
            navigate('levelSelect');
          }}
          onRetry={() => {
            setShowWin(false);
            startLevel(activeLevel);
          }}
        />
      )}
    </div>
  );
}
