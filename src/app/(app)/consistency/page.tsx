import { getTemplates, getCalculators } from '@/lib/db/consistency';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { TemplatesManager } from './TemplatesManager';
import { CalculatorsList } from './CalculatorsList';

export default async function ConsistencyPage() {
  const [templates, calculators] = await Promise.all([getTemplates(), getCalculators()]);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Consistency Calculator" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Plan a safe day-by-day path to your target profit without breaking a consistency rule —
            no single day can be more than X% of your total.
          </p>
          <Card title="Templates">
            <TemplatesManager initialTemplates={templates} />
          </Card>
          <Card title="Your Calculators">
            <CalculatorsList initialCalculators={calculators} templates={templates} />
          </Card>
        </div>
      </div>
    </div>
  );
}
