import { Topbar } from '@/components/layout/Topbar';
import { CsvImporter } from '@/components/trades/CsvImporter';

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Import Trades" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-4xl">
          <CsvImporter />
        </div>
      </div>
    </div>
  );
}
