import { motion } from 'framer-motion';
import { Play, HelpCircle, Award } from 'lucide-react';

export function MainMenu({ onPlay, onHowToPlay, onAchievements }: { onPlay: () => void; onHowToPlay: () => void; onAchievements: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 pt-8">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, type: 'spring' }} className="text-center">
        <h1 className={`text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400`}>PUZZLEVERSE</h1>
        <p className="text-sm text-slate-400 mt-2 tracking-widest uppercase">Мультивселенная головоломок</p>
      </motion.div>

      <motion.div className="w-full flex flex-col gap-3 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button onClick={onPlay} className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition active:scale-95`}>
          <Play className="w-6 h-6" /> Играть
        </button>
        <button onClick={onAchievements} className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-sm transition active:scale-95`}>
          <Award className="w-6 h-6" /> Достижения
        </button>
        <button onClick={onHowToPlay} className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-sm transition active:scale-95`}>
          <HelpCircle className="w-6 h-6" /> Как играть
        </button>
      </motion.div>

      <motion.p className="text-xs text-slate-500 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        Версия 1.0 · Pure Frontend · Telegram Web App
      </motion.p>
    </div>
  );
}
