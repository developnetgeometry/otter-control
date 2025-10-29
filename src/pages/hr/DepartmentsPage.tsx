import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { useDepartments, useDeleteDepartment } from '@/hooks/useDepartments';
import { AddDepartmentDialog } from '@/components/hr/AddDepartmentDialog';
import { EditDepartmentDialog } from '@/components/hr/EditDepartmentDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Department } from '@/lib/api/departments';

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setEditDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment.mutate(selectedDepartment.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedDepartment(null);
        }
      });
    }
  };

  const columns = [
    {
      header: 'Code',
      accessorKey: 'code' as keyof Department
    },
    {
      header: 'Name',
      accessorKey: 'name' as keyof Department
    },
    {
      header: 'Actions',
      cell: (row: Department) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage company departments</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>View and manage department information</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={departments || []}
            columns={columns}
            isLoading={isLoading}
            searchable
            emptyMessage="No departments found"
          />
        </CardContent>
      </Card>

      <AddDepartmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      
      {selectedDepartment && (
        <>
          <EditDepartmentDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            department={selectedDepartment}
          />
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Department"
            description={`Are you sure you want to delete "${selectedDepartment.name}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )}
    </div>
  );
}
