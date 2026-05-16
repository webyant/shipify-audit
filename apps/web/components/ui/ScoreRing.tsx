'use client';
import { motion } from 'framer-motion';
import { scoreToColor, scoreToGrade } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 8,
  label,
  animated = true,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreToColor(score);
  const grade = scoreToGrade(score);
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${score}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animated ? offset : offset }}
          transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          filter={`url(#glow-${score})`}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animated ? (
            <Counter from={0} to={score} />
          ) : score}
        </motion.span>
        <span className="text-xs text-white/40 mt-0.5">/100</span>
        {grade && (
          <motion.span
            className="text-sm font-semibold mt-1"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {grade}
          </motion.span>
        )}
      </div>

      {label && (
        <span className="mt-3 text-xs text-white/50 font-medium tracking-wide uppercase">
          {label}
        </span>
      )}
    </div>
  );
}

function Counter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    const step = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (to - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [from, to]);

  return <>{count}</>;
}

import React from 'react';
