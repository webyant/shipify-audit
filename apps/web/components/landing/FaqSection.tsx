'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ = [
  { q: 'Do I need to give you access to my Shopify admin?', a: 'No. AuditIQ works entirely from the public-facing storefront URL. We never request Shopify login credentials or admin access.' },
  { q: 'How accurate are the AI recommendations?', a: 'Our AI is trained on thousands of Shopify stores and the latest CRO, SEO, and performance research. Recommendations are store-specific and prioritized by estimated revenue impact.' },
  { q: 'How long does an audit take?', a: 'Most audits complete in 20–35 seconds. Complex stores with many third-party apps may take up to 60 seconds.' },
  { q: 'What is the Revenue Leak Estimator?', a: "Based on your store's issues, average Shopify conversion rates, and typical AOV patterns, we estimate how much revenue you may be losing per month due to each identified problem." },
  { q: 'Can I export the audit report to PDF?', a: 'Yes. Every audit generates a branded PDF report with scores, all issues, recommendations, and your revenue opportunity summary.' },
  { q: 'How is competitor benchmarking calculated?', a: 'We maintain live benchmarks from the top-performing Shopify stores across 30+ verticals. Your scores are compared against both industry averages and top-10% performers.' },
  { q: 'Is my store data private?', a: 'Yes. We only analyze publicly available data from your storefront. We never store login credentials or access your orders, customers, or financials.' },
  { q: 'What tech does the audit use under the hood?', a: 'We use Google Lighthouse, Puppeteer, PageSpeed Insights API, and custom Shopify-specific heuristics powered by our AI recommendation engine.' },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} className="relative py-32 px-4 bg-[#f8f9ff]">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 mb-4">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Common <span className="gradient-text">questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'bg-white rounded-xl border transition-all duration-300 overflow-hidden',
                open === i ? 'border-brand-300 shadow-[0_0_0_3px_rgba(99,102,241,0.06)]' : 'border-gray-200',
              )}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium text-gray-800 text-sm pr-4">{item.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className={cn('w-4 h-4 transition-colors', open === i ? 'text-brand-500' : 'text-gray-400')} />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
