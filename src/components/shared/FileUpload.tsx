import { useCallback, useState } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export const FileUpload = ({
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 5,
  value,
  onFileSelect,
  className
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    
    return true;
  };
  
  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className={cn('space-y-2', className)}>
      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: {maxSize}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(value.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFileSelect(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
