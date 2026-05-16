'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import type { AuditHistoryEntry } from '@shopify-audit/shared';
import { GlassCard } from '@/components/ui/GlassCard';
import { Spinner } from '@/components/ui/Spinner';
import { scoreToColor, scoreToGrade } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [audits, setAudits] = useState<AuditHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/api').then(({ api }) => {
      api.getHistory()
        .then(setAudits)
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Audit History</h1>
            <p className="text-gray-400 text-sm">{audits.length} audits total</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-semibold hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            New Audit
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Spinner size={32} className="text-brand-500" />
          </div>
        ) : audits.length === 0 ? (
          <GlassCard className="text-center py-24">
            <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No audits yet</h3>
            <p className="text-gray-400 text-sm mb-8">Run your first store audit to see results here.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-semibold"
            >
              Run Free Audit
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {audits.map((audit, i) => (
              <motion.div
                key={audit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/audit/${audit.id}`}>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-brand-200 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-5">
                      <div
                        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
                        style={{ background: `${scoreToColor(audit.overallScore)}15` }}
                      >
                        <span className="text-xl font-bold tabular-nums" style={{ color: scoreToColor(audit.overallScore) }}>
                          {audit.overallScore}
                        </span>
                        <span className="text-xs" style={{ color: scoreToColor(audit.overallScore) }}>
                          {scoreToGrade(audit.overallScore)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 truncate">
                            {audit.url.replace(/^https?:\/\//, '')}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0 group-hover:text-brand-500 transition-colors" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        audit.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        audit.status === 'running'   ? 'bg-brand-50 text-brand-600' :
                        audit.status === 'failed'    ? 'bg-red-50 text-red-500' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {audit.status}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
