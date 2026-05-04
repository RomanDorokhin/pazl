import { ShoppingCart, BarChart3, Settings } from 'lucide-react';
import type { PlayerStats } from '@/types/game';

export function HeaderBar({
  stats,
  onShop,
  onStats,
  onSettings,
}: {
  stats: PlayerStats;
  onShop: () => void;
  onStats: () => void;
  onSettings: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center gap-1">
          <span className="text-purple-300 text-xs font-bold">💎</span>
          <span className="text-sm font-bold">{stats.crystals}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onShop} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 transition active:scale-95" title="Магазин">
          <ShoppingCart className="w-5 h-5" />
        </button>
        <button onClick={onStats} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 transition active:scale-95" title="Статистика">
          <BarChart3 className="w-5 h-5" />
        </button>
        <button onClick={onSettings} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 transition active:scale-95" title="Настройки">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
