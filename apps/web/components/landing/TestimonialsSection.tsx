'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  { quote: "AuditIQ found 3 critical issues that were costing us an estimated $8,000/month in abandoned carts. Fixed them in a week.", author: "Sarah Chen", role: "Founder, LumaSkin", revenue: "+$8K/month recovered", avatar: "SC", color: "#6366f1" },
  { quote: "Our store speed went from 42 to 89 on PageSpeed in 2 days. The AI fix recommendations were incredibly specific and actionable.", author: "Marcus Webb", role: "Head of Growth, Drip Apparel", revenue: "2.1x speed improvement", avatar: "MW", color: "#10b981" },
  { quote: "As an agency, we use AuditIQ for every onboarding audit. It finds things our team would miss and generates client reports automatically.", author: "Priya Nair", role: "Director, Pixel Commerce", revenue: "25 stores managed", avatar: "PN", color: "#d946ef" },
  { quote: "The SEO analysis alone was worth it. We were missing schema markup on 80% of our products. Rankings improved within 3 weeks.", author: "Jake Torres", role: "CMO, NorthBound Gear", revenue: "+42% organic traffic", avatar: "JT", color: "#f59e0b" },
  { quote: "Found 12 apps we didn't even know were active. Removing them cut our load time by 2.4 seconds. Conversion rate jumped 18%.", author: "Aisha Okafor", role: "eCommerce Manager, VelvetRun", revenue: "+18% conversion", avatar: "AO", color: "#06b6d4" },
  { quote: "The competitor benchmarking feature is exceptional. Seeing exactly where we lag behind industry leaders is invaluable.", author: "David Park", role: "CEO, Forma Basics", revenue: "Top 10% in category", avatar: "DP", color: "#f43f5e" },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden bg-white">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 mb-4">
            RESULTS
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Merchants <span className="gradient-text">love it</span>
          </h2>
          <p className="text-gray-500 text-lg">Join 14,000+ Shopify stores already optimized.</p>
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.author}
              initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              className="break-inside-avoid bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] transition-all">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{ background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}20` }}>
                {t.revenue}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${t.color}15`, color: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
