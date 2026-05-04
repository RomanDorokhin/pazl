import { motion } from 'framer-motion';
import { ArrowLeft, Grid3X3, Image, Timer, EyeOff, Sword } from 'lucide-react';
import type { GameMode } from '@/types/game';

const MODES: { mode: GameMode; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { mode: 'classic', label: 'Классика', desc: 'Классические пятнашки', icon: <Grid3X3 className="w-6 h-6" />, color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30' },
  { mode: 'image', label: 'Картинки', desc: 'Собери изображение', icon: <Image className="w-6 h-6" />, color: 'from-pink-500/20 to-rose-500/20 border-pink-400/30' },
  { mode: 'timed', label: 'На время', desc: 'Гонка с таймером', icon: <Timer className="w-6 h-6" />, color: 'from-orange-500/20 to-amber-500/20 border-orange-400/30' },
  { mode: 'hardcore', label: 'Хардкор', desc: 'Без номеров на плитках', icon: <EyeOff className="w-6 h-6" />, color: 'from-red-500/20 to-rose-500/20 border-red-400/30' },
  { mode: 'challenge', label: 'Испытание', desc: 'Ограниченные ходы', icon: <Sword className="w-6 h-6" />, color: 'from-violet-500/20 to-purple-500/20 border-violet-400/30' },
];

export function ModeSelect({ onSelect, onBack }: { onSelect: (m: GameMode) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Режимы</h2>
      </div>
      {MODES.map((m, i) => (
        <motion.button
          key={m.mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => onSelect(m.mode)}
          className={`w-full p-4 rounded-2xl border bg-gradient-to-r ${m.color} backdrop-blur-sm flex items-center gap-4 hover:brightness-110 transition active:scale-95 text-left`}
        >
          <div className="p-3 rounded-xl bg-white/10">{m.icon}</div>
          <div>
            <div className="font-bold text-lg">{m.label}</div>
            <div className="text-xs text-slate-300">{m.desc}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
