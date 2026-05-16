import { cn } from '@/lib/utils';
import type { IssueSeverity } from '@shopify-audit/shared';

const variantMap: Record<IssueSeverity, string> = {
  critical: 'badge-critical',
  high:     'badge-high',
  medium:   'badge-medium',
  low:      'badge-low',
  info:     'badge-info',
};

interface BadgeProps {
  severity?: IssueSeverity;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ severity = 'info', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantMap[severity],
      className,
    )}>
      {children}
    </span>
  );
}
