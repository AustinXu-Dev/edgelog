import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { processCsvImport, handleCsvImportFailure } from '@/inngest/functions/processCsv';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processCsvImport, handleCsvImportFailure],
});
