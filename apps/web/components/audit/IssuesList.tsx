'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign, TrendingUp, Wrench } from 'lucide-react';
import type { AuditIssue } from '@shopify-audit/shared';
import { Badge } from '@/components/ui/Badge';

export function IssuesList({ issues }: { issues: AuditIssue[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
        <p className="text-gray-400 text-sm">No issues found in this category.</p>
      </div>
    );
  }

  const sorted = [...issues].sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-2">
      {sorted.map((issue, i) => (
        <motion.div key={issue.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
            expanded === issue.id ? 'border-brand-300 shadow-[0_0_0_3px_rgba(99,102,241,0.06)]' : 'border-gray-100 hover:border-gray-200'
          }`}>
          <button onClick={() => setExpanded(expanded === issue.id ? null : issue.id)}
            className="w-full flex items-start gap-4 p-5 text-left">
            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm">{issue.title}</span>
                <Badge severity={issue.severity}>{issue.severity}</Badge>
              </div>
              <p className="text-gray-400 text-xs line-clamp-2">{issue.description}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {issue.revenueImpact && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <DollarSign className="w-3 h-3" />{issue.revenueImpact}
                </span>
              )}
              <motion.div animate={{ rotate: expanded === issue.id ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {expanded === issue.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="border-t border-gray-100 p-5 grid md:grid-cols-3 gap-6 bg-gray-50/50">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Business Impact
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{issue.businessImpact}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Recommended Fix
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{issue.recommendation}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Estimated Gain
                    </h4>
                    <p className="text-sm text-emerald-600 font-medium">{issue.estimatedGain}</p>
                    {issue.revenueImpact && (
                      <p className="text-xs text-gray-400 mt-1">Revenue impact: {issue.revenueImpact}</p>
                    )}
                    <div className="mt-3">
                      <span className="text-xs text-gray-400">Technical detail</span>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{issue.technicalDetails}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
