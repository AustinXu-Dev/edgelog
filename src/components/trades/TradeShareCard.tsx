'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TradeWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface Props {
  trade: TradeWithDetails;
}

export function TradeShareCard({ trade }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Revoke blob URL on unmount or when url changes
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleOpen = useCallback(async () => {
    setIsOpen(true);
    setIsGenerating(true);
    try {
      const res = await fetch('/api/og/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
      });
      if (!res.ok) throw new Error('Image generation failed');
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [trade]);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `trade-${trade.instrument}-${trade.entry_datetime.slice(0, 10)}.png`;
    link.href = previewUrl;
    link.click();
  }, [previewUrl, trade]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setPreviewUrl(null);
  }, []);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="flex flex-col items-center gap-4">
            {isGenerating ? (
              <div className="w-[440px] flex items-center justify-center rounded-2xl bg-[#0d1117] text-gray-500 text-sm" style={{ height: 200 }}>
                Generating…
              </div>
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Trade share card" className="rounded-2xl" style={{ maxHeight: '80vh' }} />
            ) : (
              <div className="w-[440px] flex items-center justify-center rounded-2xl bg-[#0d1117] text-red-400 text-sm" style={{ height: 200 }}>
                Failed to generate image
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={handleDownload}
                disabled={!previewUrl}
                className="px-5 py-2.5 bg-green-400 text-black font-semibold text-sm rounded-lg disabled:opacity-40"
              >
                Download PNG
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-gray-400 text-sm border border-gray-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
