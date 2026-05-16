'use client';

import { motion } from 'framer-motion';
import type { SeoData } from '@shopify-audit/shared';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SeoPanelProps {
  data: SeoData;
}

const Check = ({ ok, warn }: { ok: boolean; warn?: boolean }) =>
  ok
    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
    : warn
    ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
    : <XCircle className="w-4 h-4 text-red-400 shrink-0" />;

export function SeoPanel({ data }: SeoPanelProps) {
  const checks = [
    { label: 'Meta Title Present', ok: data.hasMetaTitle, detail: `${data.metaTitleLength} chars` },
    { label: 'Meta Title Length (50–60)', ok: data.metaTitleLength >= 50 && data.metaTitleLength <= 60, warn: data.metaTitleLength > 0 },
    { label: 'Meta Description Present', ok: data.hasMetaDescription, detail: `${data.metaDescriptionLength} chars` },
    { label: 'Schema Markup', ok: data.hasSchemaMarkup, detail: data.schemaTypes.join(', ') || 'None detected' },
    { label: 'Sitemap.xml', ok: data.hasSitemap },
    { label: 'Robots.txt', ok: data.hasRobotsTxt },
    { label: 'Canonical Tag', ok: data.canonicalSet },
    { label: 'H1 Heading', ok: data.headingStructure.h1 === 1, detail: `${data.headingStructure.h1} found` },
    { label: 'Images with ALT Text', ok: data.imagesWithoutAlt === 0, detail: `${data.imagesWithoutAlt} missing`, warn: data.imagesWithoutAlt > 0 },
    { label: 'No Broken Links', ok: data.brokenLinks === 0, detail: `${data.brokenLinks} found`, warn: data.brokenLinks > 0 },
    { label: 'Internal Links', ok: data.internalLinks >= 3, detail: `${data.internalLinks} links` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-center py-8">
          <ScoreRing score={data.score} label="SEO Score" animated />
        </GlassCard>

        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">SEO Checklist</h3>
            <div className="space-y-3">
              {checks.map(({ label, ok, warn, detail }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <Check ok={ok} warn={warn} />
                  <span className="text-sm text-gray-700 flex-1">{label}</span>
                  {detail && (
                    <span className="text-xs text-gray-400">{detail}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
