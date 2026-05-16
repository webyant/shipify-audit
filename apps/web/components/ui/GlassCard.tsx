'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function GlassCard({ children, hover = true, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300',
        hover && 'hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:border-brand-200',
        className,
      )}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
