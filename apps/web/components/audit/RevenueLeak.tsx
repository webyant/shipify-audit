'use client';

import { motion } from 'framer-motion';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import type { AuditIssue } from '@shopify-audit/shared';
import { formatCurrency } from '@/lib/utils';

interface RevenueLeakProps {
  amount: number;
  issues: AuditIssue[];
}

export function RevenueLeak({ amount, issues }: RevenueLeakProps) {
  const topIssues = issues
    .filter(i => i.revenueImpact)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);

  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
            <TrendingDown className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Monthly Revenue Leak</p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-extrabold text-red-500"
            >
              {formatCurrency(amount)}
            </motion.div>
            <p className="text-xs text-gray-400 mt-1">Based on your issues, industry CVR data, and AOV benchmarks</p>
          </div>
        </div>

        {topIssues.length > 0 && (
          <div className="flex-1 grid sm:grid-cols-2 gap-3 sm:border-l sm:border-red-200 sm:pl-6">
            {topIssues.map(issue => (
              <div key={issue.id} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">{issue.title}</p>
                  <p className="text-xs text-red-500 font-semibold">{issue.revenueImpact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
