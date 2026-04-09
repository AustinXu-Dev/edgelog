'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AIAnalysis } from '@/components/ui/AIAnalysis';

interface Props {
  accountId: string | null;
}

export function DashboardAIInsights({ accountId }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    setAnalyzing(true);
    setError('');
    setAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analysis failed');
      setAnalysis(json.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Get AI-powered insights based on your most recent closed trades.
        </p>
        <Button variant="secondary" size="sm" onClick={handleAnalyze} loading={analyzing} type="button">
          {!analyzing && <i className="lni lni-magic-wand text-sm" />}Generate AI Insights
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {analysis && <AIAnalysis content={analysis} />}
    </div>
  );
}
