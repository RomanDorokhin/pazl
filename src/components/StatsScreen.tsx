import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Gamepad2, Clock, Footprints, Flame, Star, Gem } from 'lucide-react';
import type { LevelProgress, PlayerStats } from '@/types/game';

export function StatsScreen({ stats, levels, onBack }: { stats: PlayerStats; levels: LevelProgress[]; onBack: () => void }) {
  const completed = levels.filter((l) => l.completed).length;
  const totalStars = levels.reduce((sum, l) => sum + l.stars, 0);
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Статистика</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Gamepad2 className="w-5 h-5" />} label="Игры" value={stats.totalGames} />
        <StatCard icon={<Trophy className="w-5 h-5" />} label="Победы" value={stats.totalWins} />
        <StatCard icon={<Footprints className="w-5 h-5" />} label="Всего ходов" value={stats.totalMoves} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Лучшее время" value={stats.bestTime === null ? '—' : `${stats.bestTime}s`} />
        <StatCard icon={<Star className="w-5 h-5" />} label="Звёзды" value={totalStars} />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Серия" value={stats.bestStreak} />
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-xs uppercase text-slate-400 mb-1">Прогресс уровней</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completed / levels.length) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
            />
          </div>
          <span className="text-sm font-bold">{completed}/{levels.length}</span>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gem className="w-5 h-5 text-purple-400" />
          <span className="font-bold">Кристаллы</span>
        </div>
        <span className="font-bold text-xl">{stats.crystals}</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
      <div className="text-slate-400">{icon}</div>
      <div className="font-bold text-lg">{value}</div>
      <div className="text-[10px] uppercase text-slate-500">{label}</div>
    </div>
  );
}
