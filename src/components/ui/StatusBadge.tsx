import { Badge } from '@/components/ui/badge';
import { getStatusConfig } from '@/lib/otms-utils';
import type { OtStatus } from '@/types/otms';

interface StatusBadgeProps {
  status: OtStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
};
