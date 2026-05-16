'use client';

import { motion } from 'framer-motion';
import type { SpeedData } from '@shopify-audit/shared';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { formatMs, formatBytes } from '@/lib/utils';

const VITALS = [
  { key: 'lcp',  label: 'LCP',  description: 'Largest Contentful Paint', good: 2500, needs: 4000 },
  { key: 'cls',  label: 'CLS',  description: 'Cumulative Layout Shift',  good: 0.1,  needs: 0.25 },
  { key: 'inp',  label: 'INP',  description: 'Interaction to Next Paint', good: 200, needs: 500 },
  { key: 'ttfb', label: 'TTFB', description: 'Time to First Byte',        good: 800, needs: 1800 },
  { key: 'fcp',  label: 'FCP',  description: 'First Contentful Paint',    good: 1800, needs: 3000 },
  { key: 'tbt',  label: 'TBT',  description: 'Total Blocking Time',       good: 200, needs: 600 },
];

interface SpeedPanelProps {
  data: SpeedData;
}

export function SpeedPanel({ data }: SpeedPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center justify-center py-8">
          <ScoreRing score={data.score} label="Speed Score" animated />
        </GlassCard>

        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {VITALS.map(v => {
            const val = data.coreWebVitals[v.key as keyof typeof data.coreWebVitals];
            if (val === null || val === undefined) return null;
            const isMs = v.key !== 'cls';
            const formatted = isMs ? formatMs(val as number) : (val as number).toFixed(3);
            const numVal = val as number;
            const good = numVal <= v.good;
            const color = good ? '#10b981' : numVal <= v.needs ? '#f59e0b' : '#ef4444';

            return (
              <motion.div
                key={v.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{v.label}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="text-2xl font-bold tabular-nums mb-1" style={{ color }}>
                  {formatted}
                </div>
                <div className="text-xs text-gray-400">{v.description}</div>
                <div className="mt-2 text-xs" style={{ color }}>
                  {good ? 'Good' : numVal <= v.needs ? 'Needs Improvement' : 'Poor'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Page Size', value: formatBytes(data.totalPageSize), color: '#818cf8' },
          { label: 'Total Requests', value: `${data.totalRequests}`, color: '#06b6d4' },
          { label: 'Render Blocking', value: `${data.renderBlockingResources}`, color: data.renderBlockingResources > 0 ? '#f43f5e' : '#10b981' },
          { label: '3rd Party Requests', value: `${data.thirdPartyRequests}`, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} className="text-center py-5" hover>
            <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
