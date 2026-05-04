import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gem, Check } from 'lucide-react';
import { SHOP_ITEMS } from '@/lib/storage';
import type { PlayerStats, Theme, ThemeName } from '@/types/game';
import { THEMES } from '@/types/game';

export function Shop({
  stats,
  ownedThemes,
  onBuy,
  onBack,
}: {
  stats: PlayerStats;
  inventory: { hints: number; magics: number; shuffles: number };
  ownedThemes: ThemeName[];
  onBuy: (id: string) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [tab, setTab] = useState<'items' | 'themes'>('items');

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Магазин</h2>
        <div className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/10">
          <Gem className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-sm">{stats.crystals}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('items')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${tab === 'items' ? 'bg-white/20 border border-white/20' : 'bg-white/5 border border-white/10'}`}>Бусты</button>
        <button onClick={() => setTab('themes')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition ${tab === 'themes' ? 'bg-white/20 border border-white/20' : 'bg-white/5 border border-white/10'}`}>Темы</button>
      </div>

      {tab === 'items' && (
        <div className="flex flex-col gap-3">
          {SHOP_ITEMS.filter((i) => i.type !== 'theme').map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="p-3 rounded-xl bg-white/10">{getIcon(item.icon)}</div>
              <div className="flex-1">
                <div className="font-bold">{item.name}</div>
                <div className="text-xs text-slate-400">{item.description}</div>
              </div>
              <button
                onClick={() => onBuy(item.id)}
                disabled={stats.crystals < item.cost}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm disabled:opacity-30 active:scale-95 transition flex items-center gap-1"
              >
                <Gem className="w-4 h-4 text-purple-400" /> {item.cost}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'themes' && (
        <div className="flex flex-col gap-3">
          {SHOP_ITEMS.filter((i) => i.type === 'theme').map((item, i) => {
            const owned = ownedThemes.includes(item.target!);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${THEMES[item.target as ThemeName].bg}`}>{getIcon(item.icon)}</div>
                <div className="flex-1">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
                {owned ? (
                  <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 font-bold text-sm flex items-center gap-1 text-green-400">
                    <Check className="w-4 h-4" /> Есть
                  </div>
                ) : (
                  <button
                    onClick={() => onBuy(item.id)}
                    disabled={stats.crystals < item.cost}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-sm disabled:opacity-30 active:scale-95 transition flex items-center gap-1"
                  >
                    <Gem className="w-4 h-4 text-purple-400" /> {item.cost}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getIcon(name: string) {
  // simplified mapping using lucide-react would require imports; using text fallback for brevity
  const map: Record<string, string> = {
    Lightbulb: '💡',
    Wand2: '✨',
    Shuffle: '🔀',
    TreePine: '🌲',
    Waves: '🌊',
    Sun: '☀️',
    Contrast: '◐',
  };
  return <span className="text-xl">{map[name] || '📦'}</span>;
}
