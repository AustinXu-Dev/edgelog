'use client';

import { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { validateAndParseCsvRows, type ParsedCsvTrade, type CsvParseError } from '@/lib/utils/csv';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';
import { revalidateDashboard } from '@/app/actions/dashboard';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Job {
  id: string;
  status: JobStatus;
  total: number;
  inserted: number | null;
  skipped: number | null;
  error: string | null;
}

export function CsvImporter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedCsvTrade[] | null>(null);
  const [errors, setErrors] = useState<CsvParseError[]>([]);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [importError, setImportError] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { trades, errors } = validateAndParseCsvRows(results.data as Record<string, string>[]);
        setPreview(trades);
        setErrors(errors);
        setJob(null);
        setImportError('');
      },
    });
  }

  function pollJob(jobId: string) {
    pollRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/jobs/${jobId}`, { signal: controller.signal });
        if (!res.ok) {
          setImportError('Failed to check import status');
          setLoading(false);
          return;
        }

        const data: Job = await res.json();
        if (!mountedRef.current) return;

        setJob(data);

        if (data.status === 'completed') {
          setPreview(null);
          if (fileRef.current) fileRef.current.value = '';
          await revalidateDashboard();
          setLoading(false);
        } else if (data.status === 'failed') {
          setImportError(data.error ?? 'Import failed');
          setLoading(false);
        } else {
          pollJob(jobId);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setImportError('Failed to check import status');
        setLoading(false);
      }
    }, 2000);
  }

  async function handleImport() {
    if (!preview || preview.length === 0) return;
    setLoading(true);
    setImportError('');
    setJob(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const response = await fetch('/api/trades/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trades: preview }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      setImportError(data.error ?? 'Import failed');
      setLoading(false);
      return;
    }

    const { jobId } = data as { jobId: string };
    pollJob(jobId);
  }

  const statusLabel: Record<JobStatus, string> = {
    pending: 'Queued…',
    processing: 'Importing…',
    completed: 'Import complete',
    failed: 'Import failed',
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Upload a CSV file with columns:{' '}
          <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-xs">
            instrument, direction, entry_price, exit_price, position_size, entry_datetime,
            exit_datetime, stop_loss_planned, take_profit_planned, commission, status
          </code>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-700 mb-2">Parse errors ({errors.length}):</p>
          <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>
                Row {e.row}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-gray-900">{preview.length}</span> trades parsed
              successfully
            </p>
            <Button onClick={handleImport} loading={loading}>
              Import {preview.length} trade{preview.length !== 1 ? 's' : ''}
            </Button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Instrument', 'Dir', 'Entry', 'Exit', 'Size', 'Net P&L', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-3 text-gray-500 font-semibold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((t, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 text-gray-900">{t.instrument}</td>
                    <td
                      className={`py-2 px-3 ${t.direction === 'long' ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {t.direction}
                    </td>
                    <td className="py-2 px-3 text-gray-700 font-mono">{t.entry_price}</td>
                    <td className="py-2 px-3 text-gray-700 font-mono">{t.exit_price ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-700 font-mono">{t.position_size}</td>
                    <td
                      className={`py-2 px-3 font-medium font-mono ${
                        t.net_pnl !== null && t.net_pnl > 0
                          ? 'text-emerald-600'
                          : t.net_pnl !== null && t.net_pnl < 0
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-500">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importError && <p className="text-sm text-red-600">{importError}</p>}
        </div>
      )}

      {job && (job.status === 'pending' || job.status === 'processing') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <svg
            className="animate-spin h-4 w-4 text-blue-600 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-blue-700">{statusLabel[job.status]}</p>
        </div>
      )}

      {job && job.status === 'completed' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-700 font-medium">Import complete</p>
          <p className="text-xs text-emerald-600 mt-1">
            {job.inserted} inserted, {job.skipped} skipped (duplicates)
          </p>
        </div>
      )}

      {job && job.status === 'failed' && !importError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">Import failed</p>
          {job.error && <p className="text-xs text-red-600 mt-1">{job.error}</p>}
        </div>
      )}
    </div>
  );
}
