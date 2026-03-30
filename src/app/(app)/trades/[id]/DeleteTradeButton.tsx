'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface Props {
  tradeId: string;
}

export function DeleteTradeButton({ tradeId }: Props) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await supabase.from('trades').delete().eq('id', tradeId);
    router.push('/trades');
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Delete?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} loading={loading}>Yes</Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          <i className="lni lni-xmark text-sm" />No
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      <i className="lni lni-trash-3 text-sm" />Delete
    </Button>
  );
}
