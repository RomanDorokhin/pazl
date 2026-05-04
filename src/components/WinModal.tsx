import { motion } from 'framer-motion';
import { Star, RotateCcw, Home, ArrowRight } from 'lucide-react';
import type { LevelDefinition, Theme } from '@/types/game';

export function WinModal({
  stars,
  moves,
  time,
  theme,
  onNext,
  onMenu,
  onRetry,
}: {
  stars: number;
  moves: number;
  time: number;
  level: LevelDefinition;
  theme: Theme;
  onNext: () => void;
  onMenu: () => void;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`w-full max-w-sm rounded-3xl border ${theme.cardBg} p-6 flex flex-col items-center gap-4 text-center`}
      >
        <h2 className="text-3xl font-black">Победа!</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: s <= stars ? 1 : 0.6, rotate: 0 }}
              transition={{ delay: s * 0.15, type: 'spring' }}
            >
              <Star
                className={`w-10 h-10 ${
                  s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                }`}
              />
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-xs text-slate-400">Ходы</div>
            <div className="font-bold text-lg">{moves}</div>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <div className="text-xs text-slate-400">Время</div>
            <div className="font-bold text-lg">{time}s</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full mt-2">
          <button onClick={onNext} className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/10 font-bold flex items-center justify-center gap-2 active:scale-95 transition">
            <ArrowRight className="w-5 h-5" /> Следующий
          </button>
          <button onClick={onRetry} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold flex items-center justify-center gap-2 active:scale-95 transition">
            <RotateCcw className="w-5 h-5" /> Заново
          </button>
          <button onClick={onMenu} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold flex items-center justify-center gap-2 active:scale-95 transition">
            <Home className="w-5 h-5" /> Уровни
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
