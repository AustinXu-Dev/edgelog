'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is my data secure?',
    answer:
      'Yes. Edgelog uses Supabase with Row-Level Security (RLS), meaning your data is cryptographically isolated from other users. Only you can access your trades, journal entries, and analytics — even at the database level.',
  },
  {
    question: 'Which brokers are supported?',
    answer:
      'Any broker that exports CSV trade history works with Edgelog. We have built-in point value mappings for NQ, ES, NDX100, and SPX500 futures. For other instruments, you can log trades manually in seconds.',
  },
  {
    question: 'Can I export my data?',
    answer:
      "Yes. Your data is always yours. You can export your complete trade history at any time. We don't believe in lock-in.",
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'Edgelog is a fully responsive web app optimized for mobile browsers — no install required. A dedicated native app is on the roadmap.',
  },
  {
    question: 'What markets are supported?',
    answer:
      'Edgelog is built for futures traders, with first-class support for NQ, ES, and their micro counterparts. You can also log trades in any instrument using the manual entry form.',
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
