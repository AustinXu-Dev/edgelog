import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { inngest } from '../client';
import type { ParsedCsvTrade } from '@/lib/utils/csv';

interface CsvImportEventData {
  jobId: string;
  userId: string;
  trades: ParsedCsvTrade[];
  accountId: string | null;
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const processCsvImport = inngest.createFunction(
  { id: 'process-csv-import', triggers: [{ event: 'trades/csv.import' }] },
  async ({ event, step }) => {
    const { jobId, userId, trades, accountId } = event.data as CsvImportEventData;
    const supabase = getAdminClient();

    await step.run('mark-processing', async () => {
      await supabase
        .from('import_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);
    });

    const { inserted, skipped } = await step.run('upsert-trades', async () => {
      const rows = trades.map((t) => ({
        ...t,
        user_id: userId,
        ...(accountId ? { account_id: accountId } : {}),
      }));

      const { data, error } = await supabase
        .from('trades')
        .upsert(rows, { onConflict: 'user_id,instrument,entry_datetime', ignoreDuplicates: true })
        .select();

      if (error) {
        Sentry.captureException(error, {
          tags: { operation: 'csv_import_inngest' },
          extra: { tradeCount: trades.length, userId, jobId },
        });
        throw error;
      }

      const insertedCount = data?.length ?? 0;
      return { inserted: insertedCount, skipped: trades.length - insertedCount };
    });

    await step.run('mark-completed', async () => {
      await supabase
        .from('import_jobs')
        .update({ status: 'completed', inserted, skipped })
        .eq('id', jobId);
    });

    return { inserted, skipped };
  }
);

// Listens for Inngest's built-in failure event to mark the job as failed
// after all retries are exhausted.
export const handleCsvImportFailure = inngest.createFunction(
  { id: 'handle-csv-import-failure', triggers: [{ event: 'inngest/function.failed' }] },
  async ({ event, step }) => {
    if (event.data.function_id !== 'process-csv-import') return;

    const jobId = (event.data.event as { data?: CsvImportEventData })?.data?.jobId;
    if (!jobId) return;

    const errorMessage =
      (event.data.error as { message?: string })?.message ?? 'Import failed';

    await step.run('mark-failed', async () => {
      const supabase = getAdminClient();
      await supabase
        .from('import_jobs')
        .update({ status: 'failed', error: errorMessage })
        .eq('id', jobId);
    });
  }
);
