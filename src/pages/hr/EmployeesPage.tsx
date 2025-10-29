import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { AddEmployeeDialog } from '@/components/hr/AddEmployeeDialog';
import { EditEmployeeDialog } from '@/components/hr/EditEmployeeDialog';
import { ViewEmployeeDialog } from '@/components/hr/ViewEmployeeDialog';
import type { EmployeeProfile } from '@/types/otms';

export default function EmployeesPage() {
  const { data: employees, isLoading } = useEmployees();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);

  const handleEdit = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleView = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      pending_activation: 'secondary',
      inactive: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Employee ID',
      accessorKey: 'employee_id' as keyof EmployeeProfile
    },
    {
      header: 'Full Name',
      accessorKey: 'full_name' as keyof EmployeeProfile
    },
    {
      header: 'Email',
      accessorKey: 'email' as keyof EmployeeProfile
    },
    {
      header: 'Department',
      cell: (row: EmployeeProfile) => row.department?.name || 'N/A'
    },
    {
      header: 'Position',
      accessorKey: 'position' as keyof EmployeeProfile
    },
    {
      header: 'Status',
      cell: (row: EmployeeProfile) => getStatusBadge(row.status || 'pending_activation')
    },
    {
      header: 'Actions',
      cell: (row: EmployeeProfile) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleView(row)}>
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage employee profiles and information</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>View and manage employee information</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={employees || []}
            columns={columns}
            isLoading={isLoading}
            searchable
            emptyMessage="No employees found"
          />
        </CardContent>
      </Card>

      <AddEmployeeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      
      {selectedEmployee && (
        <>
          <EditEmployeeDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            employee={selectedEmployee}
          />
          <ViewEmployeeDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            employee={selectedEmployee}
          />
        </>
      )}
    </div>
  );
}
