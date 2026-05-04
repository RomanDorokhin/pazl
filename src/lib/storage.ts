import type {
  LevelDefinition,
  LevelProgress,
  PlayerStats,
  AchievementDef,
  AchievementState,
  ThemeName,
} from '@/types/game';

const STORAGE_KEY = 'puzzleverse_save_v1';

interface SaveData {
  levels: LevelProgress[];
  stats: PlayerStats;
  achievements: AchievementState[];
}

const defaultStats: PlayerStats = {
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
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SaveData;
      // merge with defaults to support new fields
      return {
        levels: parsed.levels,
        stats: { ...defaultStats, ...parsed.stats },
        achievements: parsed.achievements,
      };
    }
  } catch {
    // ignore
  }
  return {
    levels: buildDefaultLevels(),
    stats: { ...defaultStats },
    achievements: buildDefaultAchievements(),
  };
}

export function saveSave(data: SaveData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function buildDefaultLevels(): LevelProgress[] {
  return LEVELS.map((l) => ({
    id: l.id,
    unlocked: l.id === 1,
    completed: false,
    stars: 0,
    bestMoves: null,
    bestTime: null,
  }));
}

export function buildDefaultAchievements(): AchievementState[] {
  return ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, claimed: false }));
}

export const LEVELS: LevelDefinition[] = (() => {
  const lvls: LevelDefinition[] = [];
  let id = 1;

  // ── CLASSIC ──
  for (let size = 3; size <= 5; size++) {
    for (let i = 0; i < 6; i++) {
      lvls.push({
        id: id++,
        mode: 'classic',
        size,
        starsThreshold:
          size === 3
            ? [50, 30, 15]
            : size === 4
            ? [200, 120, 60]
            : [400, 250, 150],
      });
    }
  }

  // ── IMAGE ──
  for (let i = 0; i < 10; i++) {
    lvls.push({
      id: id++,
      mode: 'image',
      size: i < 5 ? 3 : 4,
      image: `/images/puzzle_${i + 1}.jpg`,
      starsThreshold: i < 5 ? [60, 40, 20] : [250, 150, 80],
    });
  }

  // ── TIMED ──
  const timedConfigs = [
    { size: 3, limit: 60 },
    { size: 3, limit: 45 },
    { size: 3, limit: 30 },
    { size: 4, limit: 120 },
    { size: 4, limit: 90 },
    { size: 4, limit: 60 },
    { size: 5, limit: 300 },
    { size: 5, limit: 180 },
  ];
  for (const tc of timedConfigs) {
    lvls.push({
      id: id++,
      mode: 'timed',
      size: tc.size,
      timeLimit: tc.limit,
      starsThreshold: [tc.limit, Math.floor(tc.limit * 0.6), Math.floor(tc.limit * 0.35)],
    });
  }

  // ── HARDCORE ──
  for (let size = 3; size <= 4; size++) {
    for (let i = 0; i < 4; i++) {
      lvls.push({
        id: id++,
        mode: 'hardcore',
        size,
        hiddenNumbers: true,
        starsThreshold: size === 3 ? [50, 35, 20] : [200, 140, 80],
      });
    }
  }

  // ── CHALLENGE ──
  const challengeConfigs = [
    { size: 3, limit: 30 },
    { size: 3, limit: 20 },
    { size: 4, limit: 100 },
    { size: 4, limit: 60 },
    { size: 5, limit: 200 },
  ];
  for (const cc of challengeConfigs) {
    lvls.push({
      id: id++,
      mode: 'challenge',
      size: cc.size,
      moveLimit: cc.limit,
      starsThreshold: [cc.limit, Math.floor(cc.limit * 0.6), Math.floor(cc.limit * 0.35)],
    });
  }

  return lvls;
})();

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    icon: 'Footprints',
    title: 'Первые шаги',
    description: 'Пройдите любой уровень',
    condition: (s) => s.totalWins >= 1,
    reward: 10,
  },
  {
    id: 'master_10',
    icon: 'Trophy',
    title: 'Мастер головоломок',
    description: 'Пройдите 10 уровней',
    condition: (s) => s.totalWins >= 10,
    reward: 50,
  },
  {
    id: 'master_30',
    icon: 'Crown',
    title: 'Легенда',
    description: 'Пройдите 30 уровней',
    condition: (s) => s.totalWins >= 30,
    reward: 150,
  },
  {
    id: 'speed_demon',
    icon: 'Zap',
    title: 'На скорость',
    description: 'Пройдите уровень менее чем за 20 секунд',
    condition: (s) => s.bestTime !== null && s.bestTime <= 20,
    reward: 25,
  },
  {
    id: 'perfect_3',
    icon: 'Star',
    title: 'Безупречно',
    description: 'Получите 3 звезды на любом уровне',
    condition: (_, lvls) => lvls.some((l) => l.stars === 3),
    reward: 30,
  },
  {
    id: 'all_stars',
    icon: 'Sparkles',
    title: 'Коллекционер',
    description: 'Получите 3 звезды на 10 уровнях',
    condition: (_, lvls) => lvls.filter((l) => l.stars === 3).length >= 10,
    reward: 100,
  },
  {
    id: 'streak_5',
    icon: 'Flame',
    title: 'Горячая серия',
    description: 'Выиграйте 5 уровней подряд',
    condition: (s) => s.bestStreak >= 5,
    reward: 40,
  },
  {
    id: 'hint_hater',
    icon: 'Eye',
    title: 'Чистая победа',
    description: 'Пройдите 5 уровней без подсказок',
    condition: (s) => s.totalWins >= 5 && s.hintsUsed === 0,
    reward: 50,
  },
  {
    id: 'rich',
    icon: 'Gem',
    title: 'Богач',
    description: 'Накопите 200 кристаллов',
    condition: (s) => s.crystals >= 200,
    reward: 0,
  },
  {
    id: 'theme_collector',
    icon: 'Palette',
    title: 'Дизайнер',
    description: 'Разблокируйте все темы',
    condition: (s) => s.theme !== 'neon',
    reward: 50,
  },
];

export const SHOP_ITEMS = [
  { id: 'hint_pack', icon: 'Lightbulb', name: 'Набор подсказок', description: '5 подсказок', cost: 30, type: 'hint' as const },
  { id: 'magic_pack', icon: 'Wand2', name: 'Магический пак', description: '3 магических решения', cost: 50, type: 'magic' as const },
  { id: 'shuffle_pack', icon: 'Shuffle', name: 'Набор перемешиваний', description: '5 перемешиваний', cost: 20, type: 'shuffle' as const },
  { id: 'theme_forest', icon: 'TreePine', name: 'Тема Лес', description: 'Новая цветовая схема', cost: 60, type: 'theme' as const, target: 'forest' as ThemeName },
  { id: 'theme_ocean', icon: 'Waves', name: 'Тема Океан', description: 'Новая цветовая схема', cost: 60, type: 'theme' as const, target: 'ocean' as ThemeName },
  { id: 'theme_sunset', icon: 'Sun', name: 'Тема Закат', description: 'Новая цветовая схема', cost: 60, type: 'theme' as const, target: 'sunset' as ThemeName },
  { id: 'theme_mono', icon: 'Contrast', name: 'Тема Моно', description: 'Минималистичная тема', cost: 40, type: 'theme' as const, target: 'monochrome' as ThemeName },
];
