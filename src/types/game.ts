// ── Core ──────────────────────────────────────────────────────

export type GameMode = 'classic' | 'image' | 'timed' | 'hardcore' | 'challenge';

export type ThemeName = 'neon' | 'forest' | 'ocean' | 'sunset' | 'monochrome';

export interface Theme {
  name: ThemeName;
  label: string;
  bg: string;
  cardBg: string;
  accent: string;
  tileGradient: [string, string];
  text: string;
  emptyBg: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  neon: {
    name: 'neon',
    label: 'Неон',
    bg: 'from-slate-950 via-purple-950 to-slate-950',
    cardBg: 'bg-slate-900/60 border-purple-500/30',
    accent: 'text-purple-400',
    tileGradient: ['#334155', '#1e293b'],
    text: 'text-white',
    emptyBg: 'transparent',
  },
  forest: {
    name: 'forest',
    label: 'Лес',
    bg: 'from-green-950 via-emerald-950 to-green-950',
    cardBg: 'bg-emerald-900/60 border-emerald-500/30',
    accent: 'text-emerald-400',
    tileGradient: ['#065f46', '#064e3b'],
    text: 'text-emerald-50',
    emptyBg: 'transparent',
  },
  ocean: {
    name: 'ocean',
    label: 'Океан',
    bg: 'from-blue-950 via-cyan-950 to-blue-950',
    cardBg: 'bg-blue-900/60 border-cyan-500/30',
    accent: 'text-cyan-400',
    tileGradient: ['#1e3a8a', '#172554'],
    text: 'text-blue-50',
    emptyBg: 'transparent',
  },
  sunset: {
    name: 'sunset',
    label: 'Закат',
    bg: 'from-orange-950 via-red-950 to-orange-950',
    cardBg: 'bg-orange-900/60 border-orange-500/30',
    accent: 'text-orange-400',
    tileGradient: ['#9a3412', '#7c2d12'],
    text: 'text-orange-50',
    emptyBg: 'transparent',
  },
  monochrome: {
    name: 'monochrome',
    label: 'Моно',
    bg: 'from-neutral-950 via-gray-900 to-neutral-950',
    cardBg: 'bg-neutral-800/60 border-neutral-500/30',
    accent: 'text-gray-300',
    tileGradient: ['#525252', '#262626'],
    text: 'text-neutral-100',
    emptyBg: 'transparent',
  },
};

export interface LevelDefinition {
  id: number;
  mode: GameMode;
  size: number;
  timeLimit?: number;          // секунды (для timed)
  moveLimit?: number;          // для challenge
  hiddenNumbers?: boolean;     // для hardcore
  image?: string;              // путь к картинке (для image)
  starsThreshold: [number, number, number]; // ходы/время для 1/2/3 звёзд
}

export interface LevelProgress {
  id: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestMoves: number | null;
  bestTime: number | null;
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalMoves: number;
  bestTime: number | null;
  bestMoves: number | null;
  currentStreak: number;
  bestStreak: number;
  crystals: number;
  hintsUsed: number;
  magicsUsed: number;
  shufflesUsed: number;
  theme: ThemeName;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  description: string;
  condition: (s: PlayerStats, levels: LevelProgress[]) => boolean;
  reward: number; // crystals
}

export interface AchievementState {
  id: string;
  unlocked: boolean;
  claimed: boolean;
}

export interface GameState {
  tiles: number[];
  emptyIndex: number;
  moves: number;
  timer: number;
  started: boolean;
  won: boolean;
  activeLevel: LevelDefinition | null;
}

export type Screen =
  | 'menu'
  | 'modeSelect'
  | 'levelSelect'
  | 'game'
  | 'shop'
  | 'achievements'
  | 'stats'
  | 'settings'
  | 'howToPlay';

// ── Shop ──────────────────────────────────────────────────────

export interface ShopItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  cost: number;
  type: 'hint' | 'magic' | 'shuffle' | 'theme';
  target?: ThemeName;
}
