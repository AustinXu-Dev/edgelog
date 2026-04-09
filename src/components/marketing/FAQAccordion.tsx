'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What markets and instruments are supported?',
    answer:
      'Edgelog supports CME futures (NQ, ES, MNQ, MES, YM, GC, CL, and more), index CFDs (NDX100, SPX500, US30, GER40), forex majors, gold and silver CFDs, and crypto (BTC, ETH). Point values are built in for all supported instruments — P&L is calculated automatically.',
  },
  {
    question: 'Which brokers work with the CSV import?',
    answer:
      'Any broker that exports a CSV trade history works. The importer is flexible — map your columns on upload and Edgelog handles the rest. You can also log trades manually in seconds if your broker doesn\'t support CSV export.',
  },
  {
    question: 'What are Playbooks?',
    answer:
      'Playbooks are your named trading strategies or setups — things like "Breakout Retest", "London Open Fade", or "VWAP Reclaim". You define them once, then tag each trade with the applicable playbook. Edgelog tracks win rate, average R, and trade count per playbook so you know exactly what\'s working.',
  },
  {
    question: 'How does the AI Coach work?',
    answer:
      'The AI Coach analyzes your actual trade data — not generic advice. On each daily journal page you can request a session breakdown: mood, strategy adherence, and one specific improvement for tomorrow. On the dashboard, you can run a behavioral pattern report across your last 200 closed trades, including which strategies to double down on and what blind spots to watch for.',
  },
  {
    question: 'Can I manage multiple trading accounts?',
    answer:
      'Yes. You can create separate accounts for live, funded, and sim trading. Each account tracks its own equity curve, P&L, and analytics independently. Switch between them instantly from the sidebar.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. Edgelog uses Supabase with Row-Level Security (RLS) — your trades, journal entries, and analytics are cryptographically isolated from other users at the database level. Only you can access your data.',
  },
  {
    question: 'Can I export my data?',
    answer:
      "Yes. Export your full trade history as CSV at any time, with optional filters by instrument, direction, date range, and account. Your data is always yours — no lock-in.",
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'Edgelog is a fully responsive web app that works great on mobile — no install required. Review your trades, write your daily journal, and check your stats from any device.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between py-5 text-left text-gray-900 hover:text-blue-600 transition-colors group"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="font-medium text-sm sm:text-base">{faq.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all flex-shrink-0 ml-4 ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="pb-5 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
