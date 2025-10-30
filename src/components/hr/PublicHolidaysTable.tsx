import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { usePublicHolidays, useDeletePublicHoliday } from '@/hooks/useOTSettings';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddHolidayDialog } from './AddHolidayDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export const PublicHolidaysTable = () => {
  const { data: holidays, isLoading } = usePublicHolidays();
  const deleteHoliday = useDeletePublicHoliday();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<string | null>(null);

  const handleDelete = () => {
    if (selectedHoliday) {
      deleteHoliday.mutate(selectedHoliday, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedHoliday(null);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Holiday
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Holiday Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidays && holidays.length > 0 ? (
              holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{format(new Date(holiday.holiday_date), 'PPP')}</TableCell>
                  <TableCell>{holiday.holiday_name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedHoliday(holiday.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No public holidays added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddHolidayDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Holiday"
        description="Are you sure you want to delete this public holiday? This action cannot be undone."
        variant="destructive"
      />
    </div>
  );
};
