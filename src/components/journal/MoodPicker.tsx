'use client';

import type { Mood } from '@/lib/types';

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'focused', label: 'Focused', emoji: '🎯' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'impulsive', label: 'Impulsive', emoji: '⚡' },
];

interface Props {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
}

export function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(value === m.value ? null : m.value)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-colors ${
            value === m.value
              ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
              : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
          }`}
        >
          <span className="text-lg">{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
