'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { validateAndParseCsvRows, type ParsedCsvTrade, type CsvParseError } from '@/lib/utils/csv';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';

export function CsvImporter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedCsvTrade[] | null>(null);
  const [errors, setErrors] = useState<CsvParseError[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState('');

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
        setResult(null);
        setImportError('');
      },
    });
  }

  async function handleImport() {
    if (!preview || preview.length === 0) return;
    setLoading(true);
    setImportError('');

    const response = await fetch('/api/trades/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trades: preview }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setImportError(data.error ?? 'Import failed');
    } else {
      setResult(data);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-400 mb-3">
          Upload a CSV file with columns: <code className="text-indigo-400">instrument, direction, entry_price, exit_price, position_size, entry_datetime, exit_datetime, stop_loss_planned, take_profit_planned, commission, status</code>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
        />
      </div>

      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-sm font-medium text-red-400 mb-2">Parse errors ({errors.length}):</p>
          <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
            {errors.map((e, i) => (
              <li key={i}>Row {e.row}: {e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {preview && preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">{preview.length}</span> trades parsed successfully
            </p>
            <Button onClick={handleImport} loading={loading}>
              Import {preview.length} trade{preview.length !== 1 ? 's' : ''}
            </Button>
          </div>

          <div className="overflow-x-auto border border-gray-800 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900">
                  {['Instrument', 'Dir', 'Entry', 'Exit', 'Size', 'Net P&L', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((t, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-2 px-3 text-gray-200">{t.instrument}</td>
                    <td className={`py-2 px-3 ${t.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.direction}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{t.entry_price}</td>
                    <td className="py-2 px-3 text-gray-300">{t.exit_price ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-300">{t.position_size}</td>
                    <td className={`py-2 px-3 font-medium ${t.net_pnl !== null && t.net_pnl > 0 ? 'text-emerald-400' : t.net_pnl !== null && t.net_pnl < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {t.net_pnl !== null ? formatCurrency(t.net_pnl) : '—'}
                    </td>
                    <td className="py-2 px-3 text-gray-400">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importError && <p className="text-sm text-red-400">{importError}</p>}
        </div>
      )}

      {result && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
          <p className="text-sm text-emerald-400 font-medium">Import complete</p>
          <p className="text-xs text-emerald-300 mt-1">{result.inserted} inserted, {result.skipped} skipped (duplicates)</p>
        </div>
      )}
    </div>
  );
}
