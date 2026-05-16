'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import type { AuditResult } from '@shopify-audit/shared';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GlassCard } from '@/components/ui/GlassCard';
import { IssuesList } from './IssuesList';
import { SpeedPanel } from './SpeedPanel';
import { SeoPanel } from './SeoPanel';
import { AiInsightsPanel } from './AiInsightsPanel';
import { RevenueLeak } from './RevenueLeak';
import { CompetitorChart } from './CompetitorChart';
import { toast } from 'sonner';

const TABS = ['Overview', 'Performance', 'SEO', 'CRO', 'Security', 'AI Insights'] as const;
type Tab = typeof TABS[number];

export function AuditDashboard({ audit }: { audit: AuditResult }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [exporting, setExporting] = useState(false);

  const criticalCount = audit.issues.filter(i => i.severity === 'critical').length;
  const highCount    = audit.issues.filter(i => i.severity === 'high').length;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { api } = await import('@/lib/api');
      const blob = await api.exportPdf(audit.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `audit-${audit.url.replace(/https?:\/\//, '')}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch { toast.error('Export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-0.5">
              <span>Audit Results</span>
              <span>/</span>
              <a href={audit.url} target="_blank" rel="noopener noreferrer"
                className="text-brand-500 hover:text-brand-600 flex items-center gap-1">
                {audit.url.replace(/^https?:\/\//, '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Store Audit Report</h1>
              {criticalCount > 0 && (
                <span className="badge-critical px-2 py-0.5 rounded-full text-xs font-semibold">
                  {criticalCount} critical
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.location.reload()}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExportPdf} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all">
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export PDF'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 text-white text-sm font-medium hover:shadow-glow transition-all">
              <Mail className="w-4 h-4" />
              Email Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'text-brand-600' : 'text-gray-400 hover:text-gray-700'
                }`}>
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'Overview'     && <OverviewTab audit={audit} criticalCount={criticalCount} highCount={highCount} />}
        {activeTab === 'Performance'  && <SpeedPanel data={audit.speed} />}
        {activeTab === 'SEO'          && <SeoPanel data={audit.seo} />}
        {activeTab === 'AI Insights'  && <AiInsightsPanel insights={audit.aiInsights} />}
        {activeTab === 'CRO'          && <IssuesList issues={audit.issues.filter(i => i.category === 'cro')} />}
        {activeTab === 'Security'     && <IssuesList issues={audit.issues.filter(i => i.category === 'security')} />}
      </div>
    </div>
  );
}

function OverviewTab({ audit, criticalCount, highCount }: { audit: AuditResult; criticalCount: number; highCount: number }) {
  const scores = [
    { label: 'Performance', key: 'performance' as const },
    { label: 'SEO',         key: 'seo'         as const },
    { label: 'CRO',         key: 'cro'         as const },
    { label: 'Mobile',      key: 'mobile'      as const },
    { label: 'UX',          key: 'ux'          as const },
    { label: 'Security',    key: 'security'    as const },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center py-10">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Overall Score</p>
          <ScoreRing score={audit.scores.overall} size={200} strokeWidth={10} animated />
          <div className="mt-6 flex items-center gap-4 text-sm">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-500">
                <AlertTriangle className="w-4 h-4" /> {criticalCount} critical
              </div>
            )}
            {highCount > 0 && (
              <div className="flex items-center gap-1.5 text-orange-500">
                <AlertTriangle className="w-4 h-4" /> {highCount} high
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="col-span-1 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Category Scores</h3>
          <div className="space-y-4">
            {scores.map(({ label, key }) => (
              <ProgressBar key={key} value={audit.scores[key]} label={label} animated />
            ))}
          </div>
        </GlassCard>
      </div>

      <RevenueLeak amount={audit.revenueLeakEstimate} issues={audit.issues} />

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Issues Found ({audit.issues.length})</h3>
        <IssuesList issues={audit.issues.slice(0, 10)} />
      </div>

      {audit.competitorBenchmarks && audit.competitorBenchmarks.length > 0 && (
        <CompetitorChart benchmarks={audit.competitorBenchmarks} />
      )}
    </div>
  );
}
