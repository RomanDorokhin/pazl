import { motion } from 'framer-motion';
import { ArrowLeft, Award, Lock, Gift } from 'lucide-react';
import { ACHIEVEMENTS } from '@/lib/storage';
import type { AchievementState } from '@/types/game';

export function Achievements({
  achievements,
  onClaim,
  onBack,
}: {
  achievements: AchievementState[];
  onClaim: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Достижения</h2>
      </div>
      <div className="flex flex-col gap-3">
        {ACHIEVEMENTS.map((def, i) => {
          const state = achievements.find((a) => a.id === def.id);
          const unlocked = state?.unlocked ?? false;
          const claimed = state?.claimed ?? false;
          return (
            <motion.div
              key={def.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 p-3 rounded-2xl border transition ${
                unlocked ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className={`p-3 rounded-xl ${unlocked ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                {unlocked ? <Award className="w-6 h-6 text-yellow-400" /> : <Lock className="w-6 h-6 text-slate-500" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">{def.title}</div>
                <div className="text-xs text-slate-400">{def.description}</div>
              </div>
              {unlocked && !claimed && (
                <button onClick={() => onClaim(def.id)} className="px-3 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 font-bold text-xs flex items-center gap-1 text-yellow-300 active:scale-95 transition">
                  <Gift className="w-4 h-4" /> +{def.reward}
                </button>
              )}
              {unlocked && claimed && (
                <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">Получено</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
