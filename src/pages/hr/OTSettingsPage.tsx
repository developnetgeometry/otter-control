import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { Settings } from 'lucide-react';
import { EligibilityRulesTab } from '@/components/hr/EligibilityRulesTab';
import { RateFormulasTab } from '@/components/hr/RateFormulasTab';
import { ApprovalThresholdsTab } from '@/components/hr/ApprovalThresholdsTab';

export default function OTSettingsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">OT Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure overtime eligibility, rate formulas, and thresholds
            </p>
          </div>
        </div>

        <Tabs defaultValue="eligibility" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="eligibility">Eligibility Rules</TabsTrigger>
            <TabsTrigger value="rate-formulas">Rate Formulas</TabsTrigger>
            <TabsTrigger value="approval-thresholds">Approval Thresholds</TabsTrigger>
          </TabsList>

          <TabsContent value="eligibility" className="mt-6">
            <EligibilityRulesTab />
          </TabsContent>

          <TabsContent value="rate-formulas" className="mt-6">
            <RateFormulasTab />
          </TabsContent>

          <TabsContent value="approval-thresholds" className="mt-6">
            <ApprovalThresholdsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
