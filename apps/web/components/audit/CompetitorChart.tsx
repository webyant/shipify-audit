'use client';

import { motion } from 'framer-motion';
import type { CompetitorBenchmark } from '@shopify-audit/shared';
import { GlassCard } from '@/components/ui/GlassCard';

interface CompetitorChartProps {
  benchmarks: CompetitorBenchmark[];
}

export function CompetitorChart({ benchmarks }: CompetitorChartProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">
        Competitor Benchmarks
      </h3>
      <div className="space-y-5">
        {benchmarks.map((b, i) => (
          <motion.div
            key={b.metric}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-medium text-gray-700">{b.metric}</span>
              <div className="flex items-center gap-4 text-gray-400">
                <span><span className="text-brand-600 font-semibold">You: {b.yourScore}</span></span>
                <span>Avg: {b.industryAvg}</span>
                <span>Top: {b.topPerformer}</span>
              </div>
            </div>
            <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-px bg-gray-300"
                style={{ left: `${(b.industryAvg / Math.max(b.topPerformer, 100)) * 100}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-px bg-emerald-400"
                style={{ left: `${(b.topPerformer / Math.max(b.topPerformer, 100)) * 100}%` }}
              />
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: b.yourScore >= b.industryAvg
                    ? 'linear-gradient(90deg, #6366f1, #10b981)'
                    : 'linear-gradient(90deg, #6366f1, #f59e0b)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(b.yourScore / Math.max(b.topPerformer, 100)) * 100}%` }}
                transition={{ delay: i * 0.06 + 0.3, duration: 0.8 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-6 text-xs text-gray-400">
        <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-brand-500 rounded" /> You</div>
        <div className="flex items-center gap-2"><div className="w-px h-3 bg-gray-300" /> Industry avg</div>
        <div className="flex items-center gap-2"><div className="w-px h-3 bg-emerald-400" /> Top 10%</div>
      </div>
    </GlassCard>
  );
}
