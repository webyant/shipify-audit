'use client';
import { motion } from 'framer-motion';
import { scoreToColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  colorByScore?: boolean;
  color?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  colorByScore = true,
  color,
  className,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color ?? (colorByScore ? scoreToColor(pct) : '#6366f1');

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-white/60">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold tabular-nums" style={{ color: barColor }}>
              {Math.round(value)}{max === 100 ? '' : `/${max}`}
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor, boxShadow: `0 0 8px ${barColor}80` }}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${pct}%` : `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  );
}
