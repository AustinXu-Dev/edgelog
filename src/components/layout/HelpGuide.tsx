'use client';

import { useState } from 'react';

const sections = [
  {
    icon: 'lni-home-2',
    title: 'Dashboard',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    features: [
      { icon: 'lni-stats-up', text: 'View key metrics — total P&L, win rate, average R, and trade count' },
      { icon: 'lni-line-double', text: 'Equity curve shows your cumulative P&L over time' },
      { icon: 'lni-pie-chart', text: 'Breakdown charts by instrument, day of week, and time of day' },
      { icon: 'lni-calendar', text: 'Calendar heatmap shows daily P&L at a glance' },
      { icon: 'lni-list', text: 'Recent trades table links to full trade details' },
      { icon: 'lni-funnel', text: 'Filter by date range to analyze specific periods' },
    ],
  },
  {
    icon: 'lni-bar-chart-4',
    title: 'Trades',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    features: [
      { icon: 'lni-plus', text: 'Log new trades with entry/exit price, size, stop loss, and take profit' },
      { icon: 'lni-funnel', text: 'Filter trades by instrument, direction, status, or date range' },
      { icon: 'lni-upload', text: 'Import trades in bulk via CSV — supports futures, forex, CFDs, and crypto' },
      { icon: 'lni-download', text: 'Export filtered trades to CSV for external analysis' },
      { icon: 'lni-image', text: 'Attach screenshots and write notes on the trade detail page' },
      { icon: 'lni-tag', text: 'Tag trades with custom labels and colors for easy categorization' },
    ],
  },
  {
    icon: 'lni-notebook-1',
    title: 'Journal',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    features: [
      { icon: 'lni-pencil-alt', text: 'Write daily reflections and track your mood each trading day' },
      { icon: 'lni-link', text: 'Link specific trades to your daily journal entry' },
      { icon: 'lni-star', text: 'Rate individual trades and record strategy notes per trade' },
      { icon: 'lni-image', text: 'Upload trade screenshots for visual reference' },
      { icon: 'lni-calendar', text: 'Browse past entries — dates with notes are highlighted on the list' },
    ],
  },
  {
    icon: 'lni-briefcase',
    title: 'Accounts',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    features: [
      { icon: 'lni-plus', text: 'Create multiple accounts — live, sim, prop firm, etc.' },
      { icon: 'lni-transfer', text: 'Switch accounts from the sidebar — all data updates instantly' },
      { icon: 'lni-stats-up', text: 'Balance shown as starting balance + cumulative net P&L' },
      { icon: 'lni-trash', text: 'Delete an account and choose to keep or remove its trades' },
    ],
  },
  {
    icon: 'lni-gear-1',
    title: 'Settings',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    features: [
      { icon: 'lni-user', text: 'Update your display name and timezone in the Profile tab' },
      { icon: 'lni-briefcase', text: 'Manage all trading accounts from the Accounts tab' },
      { icon: 'lni-warning', text: 'Danger Zone — permanently close your Edgelog account and all data' },
    ],
  },
];

interface Props {
  /** "sidebar" renders an inline button; "floating" renders a fixed mobile button */
  variant: 'sidebar' | 'floating';
}

export function HelpGuide({ variant }: Props) {
  const [open, setOpen] = useState(false);

  const button =
    variant === 'sidebar' ? (
      <button
        onClick={() => setOpen(true)}
        title="Help & Guide"
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <i className="lni lni-question-circle text-sm" />
        Help
      </button>
    ) : (
      <button
        onClick={() => setOpen(true)}
        title="Help & Guide"
        className="md:hidden fixed bottom-20 right-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
      >
        <i className="lni lni-question-circle text-xl" />
      </button>
    );

  return (
    <>
      {button}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <div
            className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">App Guide</h2>
                <p className="text-xs text-gray-500 mt-0.5">Everything you can do in Edgelog</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <i className="lni lni-close text-sm" />
              </button>
            </div>

            {/* Sections */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {sections.map((section) => (
                <div key={section.title}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-7 h-7 rounded-lg ${section.bg} flex items-center justify-center`}>
                      <i className={`lni ${section.icon} text-sm ${section.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${section.color}`}>{section.title}</span>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2 pl-1">
                    {section.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <i className={`lni ${f.icon} text-gray-400 text-base mt-0.5 shrink-0`} />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Click <i className="lni lni-question-circle" /> anytime to reopen this guide
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
