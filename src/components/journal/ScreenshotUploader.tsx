'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface Props {
  tradeId: string;
  userId: string;
  existingUrl: string | null;
}

export function ScreenshotUploader({ tradeId, userId, existingUrl }: Props) {
  const supabase = createBrowserClient();
  const [url, setUrl] = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const ext = file.name.split('.').pop();
    const path = `${userId}/${tradeId}/screenshot.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: signedData } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(path, 3600);

    const screenshotUrl = signedData?.signedUrl ?? null;

    // Save URL to trade journal entry
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('trade_journal_entries').upsert(
        { trade_id: tradeId, user_id: user.id, screenshot_url: path },
        { onConflict: 'trade_id' }
      );
    }

    setUrl(screenshotUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative border border-gray-700 rounded-lg overflow-hidden">
          <Image
            src={url}
            alt="Trade screenshot"
            width={800}
            height={450}
            className="w-full object-contain max-h-96"
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploading}
            onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
          >
            {url ? 'Replace Screenshot' : 'Upload Screenshot'}
          </Button>
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
