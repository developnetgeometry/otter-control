import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  disabled?: boolean;
}

export const ExportButton = ({ data, filename = 'export', disabled = false }: ExportButtonProps) => {
  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    // Placeholder implementation
    // Will be implemented with actual export libraries in Phase 3+
    toast.info(`Export to ${format.toUpperCase()} - Coming Soon`, {
      description: `This feature will be available in the next update. ${data.length} records ready for export.`
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4 text-red-600" />
          PDF (.pdf)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <File className="mr-2 h-4 w-4 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
