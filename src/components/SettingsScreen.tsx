import { ArrowLeft, Volume2, VolumeX, Music, RotateCcw, Palette } from 'lucide-react';
import type { PlayerStats, Theme, ThemeName } from '@/types/game';
import { THEMES } from '@/types/game';

export function SettingsScreen({
  stats,
  ownedThemes,
  onChangeTheme,
  onToggleSound,
  onToggleMusic,
  onReset,
  onBack,
}: {
  stats: PlayerStats;
  ownedThemes: ThemeName[];
  onChangeTheme: (t: ThemeName) => void;
  onToggleSound: (v: boolean) => void;
  onToggleMusic: (v: boolean) => void;
  onReset: () => void;
  onBack: () => void;
  theme: Theme;
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Настройки</h2>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            {stats.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="font-bold">Звуки</span>
          </div>
          <button
            onClick={() => onToggleSound(!stats.soundEnabled)}
            className={`w-12 h-7 rounded-full transition relative ${stats.soundEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${stats.soundEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5" />
            <span className="font-bold">Музыка</span>
          </div>
          <button
            onClick={() => onToggleMusic(!stats.musicEnabled)}
            className={`w-12 h-7 rounded-full transition relative ${stats.musicEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${stats.musicEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-wider">
          <Palette className="w-4 h-4" /> Тема
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(THEMES) as ThemeName[]).map((t) => {
            const th = THEMES[t];
            const owned = ownedThemes.includes(t);
            return (
              <button
                key={t}
                disabled={!owned}
                onClick={() => onChangeTheme(t)}
                className={`p-3 rounded-2xl border transition text-left ${
                  stats.theme === t ? 'ring-2 ring-white/40' : ''
                } ${owned ? 'bg-white/10 border-white/20 hover:bg-white/20 active:scale-95' : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'}`}
              >
                <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${th.bg} mb-2`} />
                <div className="font-bold text-sm">{th.label}</div>
                {!owned && <div className="text-[10px] text-slate-500">В магазине</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            if (confirm('Сбросить весь прогресс? Это необратимо.')) onReset();
          }}
          className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <RotateCcw className="w-5 h-5" /> Сбросить прогресс
        </button>
      </div>
    </div>
  );
}
