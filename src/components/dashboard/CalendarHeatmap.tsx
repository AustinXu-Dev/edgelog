'use client';

interface Props {
  dailyPnl: Record<string, number>;
  year: number;
  month: number; // 0-indexed
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pnlToColor(pnl: number): string {
  if (pnl > 500) return 'bg-emerald-400';
  if (pnl > 100) return 'bg-emerald-600';
  if (pnl > 0) return 'bg-emerald-800';
  if (pnl < -500) return 'bg-red-400';
  if (pnl < -100) return 'bg-red-600';
  if (pnl < 0) return 'bg-red-800';
  return 'bg-gray-800';
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarHeatmap({ dailyPnl, year, month }: Props) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-600 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const pnl = dailyPnl[dateStr];
          const color = pnl !== undefined ? pnlToColor(pnl) : 'bg-gray-800 opacity-50';
          const today = new Date();
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          return (
            <div
              key={i}
              title={pnl !== undefined ? `${dateStr}: $${pnl.toFixed(2)}` : dateStr}
              className={`aspect-square rounded flex items-center justify-center text-xs cursor-default ${color} ${isToday ? 'ring-1 ring-indigo-400' : ''}`}
            >
              <span className="text-white/60 text-[10px]">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
