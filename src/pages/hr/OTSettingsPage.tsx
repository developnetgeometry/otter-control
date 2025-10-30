import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettingsForm } from '@/components/hr/GeneralSettingsForm';
import { PublicHolidaysTable } from '@/components/hr/PublicHolidaysTable';
import { RateFormulasTable } from '@/components/hr/RateFormulasTable';

export default function OTSettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OT Settings</h1>
        <p className="text-muted-foreground">Manage overtime configuration and policies</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="holidays">Public Holidays</TabsTrigger>
          <TabsTrigger value="formulas">Rate Formulas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General OT Settings</CardTitle>
              <CardDescription>
                Configure overtime submission rules and eligibility criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GeneralSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Public Holidays</CardTitle>
              <CardDescription>
                Manage public holidays for OT rate calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PublicHolidaysTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OT Rate Formulas</CardTitle>
              <CardDescription>
                View active rate calculation formulas (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RateFormulasTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
