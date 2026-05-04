import { ArrowLeft, MousePointerClick, Shuffle, Clock, Eye, Swords } from 'lucide-react';

export function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Как играть</h2>
      </div>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-slate-300">
        <Section icon={<MousePointerClick className="w-5 h-5 text-blue-400" />} title="Базовые правила">
          Передвигайте плитки, нажимая на них. Цель — расположить числа по порядку от 1 до N, оставив нижний правый угол пустым.
        </Section>
        <Section icon={<Shuffle className="w-5 h-5 text-purple-400" />} title="Режимы">
          <b>Классика</b> — обычные пятнашки. <b>Картинки</b> — соберите изображение. <b>На время</b> — решите до истечения таймера. <b>Хардкор</b> — номера скрыты, ориентируйтесь по цветам. <b>Испытание</b> — ограниченное число ходов.
        </Section>
        <Section icon={<Clock className="w-5 h-5 text-orange-400" />} title="Звёзды и награды">
          За каждый уровень можно получить 1–3 звезды в зависимости от скорости и числа ходов. Звёзды дают кристаллы.
        </Section>
        <Section icon={<Eye className="w-5 h-5 text-pink-400" />} title="Бусты">
          <b>Подсказка</b> — подсвечивает лучший ход. <b>Магия</b> — автоматически решает 3 хода. <b>Перемешать</b> — новая раскладка.
        </Section>
        <Section icon={<Swords className="w-5 h-5 text-red-400" />} title="Достижения">
          Выполняйте челленджи, чтобы получить достижения и бонусные кристаллы.
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-bold text-white mb-1">{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
