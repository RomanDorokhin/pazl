import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Star, Check } from 'lucide-react';
import type { LevelDefinition, LevelProgress } from '@/types/game';

export function LevelSelect({ levels, progress, onSelect, onBack }: { levels: LevelDefinition[]; progress: Map<number, LevelProgress>; onSelect: (l: LevelDefinition) => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-3 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Уровни</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {levels.map((lvl, i) => {
          const prog = progress.get(lvl.id);
          const unlocked = prog?.unlocked ?? false;
          const completed = prog?.completed ?? false;
          const stars = prog?.stars ?? 0;
          return (
            <motion.button
              key={lvl.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(lvl)}
              className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                unlocked
                  ? 'bg-white/10 border-white/20 hover:bg-white/20 active:scale-95'
                  : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
              }`}
            >
              {!unlocked && <Lock className="w-5 h-5 text-slate-500" />}
              {unlocked && !completed && <span className="text-xl font-bold">{lvl.size}×{lvl.size}</span>}
              {completed && <Check className="w-6 h-6 text-green-400" />}
              <div className="flex gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">#{lvl.id}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
