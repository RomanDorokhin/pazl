import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Lightbulb, Wand2, Timer, Move, AlertTriangle } from 'lucide-react';
import type { GameState, LevelDefinition, PlayerStats, Theme } from '@/types/game';
import { getTileColor } from '@/lib/gameLogic';

export function GameBoard({
  state,
  level,
  theme,
  hintTile,
  magicPath,
  inventory,
  onTileClick,
  onShuffle,
  onHint,
  onMagic,
  stats,
}: {
  state: GameState;
  level: LevelDefinition;
  theme: Theme;
  hintTile: number | null;
  magicPath: number[];
  inventory: { hints: number; magics: number; shuffles: number };
  onTileClick: (i: number) => void;
  onShuffle: () => void;
  onHint: () => void;
  onMagic: () => void;
  stats: PlayerStats;
}) {
  const size = level.size;
  const tileSize = size <= 3 ? 'w-24 h-24 text-3xl' : size === 4 ? 'w-[72px] h-[72px] text-2xl' : 'w-[58px] h-[58px] text-lg';

  const boardBg = useMemo(() => `bg-white/5 border-white/10`, []);

  const isImage = level.mode === 'image' && level.image;

  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      {/* HUD */}
      <div className={`w-full flex items-center justify-between rounded-2xl border ${boardBg} p-3`}>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase text-slate-400">Время</span>
          <span className="font-mono font-bold text-lg flex items-center gap-1">
            <Timer className="w-4 h-4 text-slate-400" />
            {state.timer}s
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase text-slate-400">Ходы</span>
          <span className="font-mono font-bold text-lg flex items-center gap-1">
            <Move className="w-4 h-4 text-slate-400" />
            {state.moves}
          </span>
        </div>
        {level.moveLimit && (
          <div className={`flex flex-col items-center ${state.moves >= level.moveLimit ? 'text-red-400' : ''}`}>
            <span className="text-[10px] uppercase text-slate-400">Лимит</span>
            <span className="font-mono font-bold text-lg flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {level.moveLimit - state.moves}
            </span>
          </div>
        )}
        {level.timeLimit && (
          <div className={`flex flex-col items-center ${state.timer >= level.timeLimit - 10 ? 'text-red-400' : ''}`}>
            <span className="text-[10px] uppercase text-slate-400">Осталось</span>
            <span className="font-mono font-bold text-lg">{Math.max(0, level.timeLimit - state.timer)}s</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className={`grid gap-2 p-3 rounded-2xl border ${boardBg}`}
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {state.tiles.map((value, index) => {
          const isEmpty = value === 0;
          const isHint = hintTile === index;
          const isMagic = magicPath.includes(index);
          const row = Math.floor(index / size);
          const col = index % size;
          const targetRow = Math.floor(value / size);
          const targetCol = value % size;
          const correct = !isEmpty && row === targetRow && col === targetCol;

          return (
            <motion.button
              key={`${value}-${index}`}
              layout
              whileTap={{ scale: 0.9 }}
              onClick={() => onTileClick(index)}
              disabled={isEmpty}
              className={`relative ${tileSize} rounded-xl flex items-center justify-center font-bold select-none transition border ${
                isEmpty
                  ? 'bg-transparent border-transparent cursor-default'
                  : `cursor-pointer shadow-lg ${level.hiddenNumbers ? 'text-transparent' : theme.text}`
              } ${isHint ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent animate-pulse' : ''} ${
                isMagic ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-transparent' : ''
              }`}
              style={
                isEmpty
                  ? {}
                  : isImage
                  ? {
                      backgroundImage: `url(${level.image})`,
                      backgroundSize: `${size * 100}%`,
                      backgroundPosition: `${(value % size) * (100 / (size - 1))}% ${Math.floor(value / size) * (100 / (size - 1))}%`,
                    }
                  : {
                      background: `linear-gradient(145deg, ${getTileColor(size, value, stats.theme)}, ${getTileColor(size, value + 1, stats.theme)})`,
                      borderColor: correct ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
                    }
              }
            >
              {!isEmpty && !isImage && !level.hiddenNumbers && value}
              {correct && !level.hiddenNumbers && (
                <div className="absolute inset-0 rounded-xl border border-green-400/40 pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="w-full flex items-center justify-center gap-3 flex-wrap">
        <button onClick={onHint} disabled={inventory.hints <= 0} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-30 active:scale-95`}>
          <Lightbulb className="w-5 h-5" />
          <span className="text-[10px]">Подсказка ({inventory.hints})</span>
        </button>
        <button onClick={onMagic} disabled={inventory.magics <= 0} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-30 active:scale-95`}>
          <Wand2 className="w-5 h-5" />
          <span className="text-[10px]">Магия ({inventory.magics})</span>
        </button>
        <button onClick={onShuffle} disabled={inventory.shuffles <= 0} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-30 active:scale-95`}>
          <Shuffle className="w-5 h-5" />
          <span className="text-[10px]">Перемешать ({inventory.shuffles})</span>
        </button>
      </div>
    </div>
  );
}
