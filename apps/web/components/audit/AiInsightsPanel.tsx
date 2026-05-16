'use client';

import { motion } from 'framer-motion';
import { Zap, DollarSign, Star } from 'lucide-react';
import type { AiInsight } from '@shopify-audit/shared';

const CATEGORY_COLORS: Record<string, string> = {
  speed:      '#f59e0b',
  mobile:     '#10b981',
  seo:        '#22c55e',
  cro:        '#d946ef',
  security:   '#06b6d4',
  images:     '#0ea5e9',
  analytics:  '#a78bfa',
  ux:         '#e879f9',
  checkout:   '#f43f5e',
};

interface AiInsightsPanelProps {
  insights: AiInsight[];
}

export function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  const sorted = [...insights].sort((a, b) => b.priorityScore - a.priorityScore);
  const quickWins = sorted.filter(i => i.quickWin);
  const strategic = sorted.filter(i => !i.quickWin);

  return (
    <div className="space-y-8">
      {quickWins.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-amber-600 text-sm uppercase tracking-wide">Quick Wins</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickWins.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {strategic.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-brand-600 text-sm uppercase tracking-wide">Strategic Improvements</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {strategic.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: AiInsight }) {
  const color = CATEGORY_COLORS[insight.category] ?? '#818cf8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="font-semibold text-gray-800 text-sm leading-snug">{insight.headline}</h4>
        <span
          className="shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide"
          style={{ background: `${color}18`, color }}
        >
          {insight.category}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-4">{insight.detail}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-emerald-600 font-medium">
          <DollarSign className="w-3.5 h-3.5" />
          {insight.revenueImpact}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Priority</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-1 rounded-full"
                style={{ background: i < Math.round(insight.priorityScore / 20) ? color : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>
      </div>
      {insight.quickWin && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <Zap className="w-3 h-3" />
          Quick Win — implement in 1 day
        </div>
      )}
    </motion.div>
  );
}
