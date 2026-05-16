'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Zap, Smartphone, ShoppingBag, Palette, LayoutGrid,
  AppWindow, Search, TrendingUp, CreditCard, Image,
  BarChart3, Shield, Server, MonitorSmartphone
} from 'lucide-react';

const AUDIT_CATEGORIES = [
  { icon: Zap,              title: 'Store Speed & Core Web Vitals',    description: 'LCP, CLS, INP, TTFB analysis with render-blocking detection and CDN optimization.',             color: '#f59e0b', metrics: ['LCP', 'CLS', 'INP'] },
  { icon: Smartphone,       title: 'Mobile Optimization',              description: 'Tap target sizing, mobile CLS, sticky ATC visibility and mobile conversion blockers.',             color: '#10b981', metrics: ['Responsiveness', 'Mobile Speed', 'UX Score'] },
  { icon: ShoppingBag,      title: 'Product Page Performance',         description: 'ATC visibility, trust badges, variant UX, upsell opportunities and schema markup.',               color: '#6366f1', metrics: ['CRO Score', 'Schema', 'Trust Signals'] },
  { icon: Palette,          title: 'Theme Quality',                    description: 'Theme age, deprecated methods, app conflicts, JS/CSS duplication and liquid bloat.',               color: '#8b5cf6', metrics: ['Health Score', 'JS Debt', 'Conflicts'] },
  { icon: LayoutGrid,       title: 'Collection Optimization',          description: 'Filtering UX, lazy loading, infinite scroll/pagination, mobile usability analysis.',               color: '#06b6d4', metrics: ['Filter UX', 'Load Speed', 'Mobile'] },
  { icon: AppWindow,        title: 'Shopify Apps Audit',               description: 'Detect heavy apps, duplicate functionality, unused embeds and tracking overload.',                 color: '#f43f5e', metrics: ['Script Weight', 'Redundancy', 'Impact'] },
  { icon: Search,           title: 'SEO Performance',                  description: 'Meta tags, schema markup, internal linking, canonicals, sitemap and robots.txt.',                  color: '#22c55e', metrics: ['SEO Score', 'Broken Links', 'Schema'] },
  { icon: TrendingUp,       title: 'Conversion Rate Optimization',     description: 'CTA visibility, social proof, scarcity indicators, cart UX and checkout friction.',               color: '#d946ef', metrics: ['CRO Score', 'Revenue Lift', 'Friction'] },
  { icon: CreditCard,       title: 'Checkout Performance',             description: 'Checkout speed, payment methods, express checkout, trust perception analysis.',                   color: '#f97316', metrics: ['Speed', 'Express Pay', 'Trust'] },
  { icon: Image,            title: 'Image & Media Optimization',       description: 'WebP/AVIF support, lazy loading, hero image sizing and unused media detection.',                   color: '#0ea5e9', metrics: ['Compression', 'WebP %', 'Lazy Load'] },
  { icon: BarChart3,        title: 'Analytics & Tracking',             description: 'GA4, Meta Pixel, TikTok Pixel, duplicate tracking and missing conversion events.',               color: '#a78bfa', metrics: ['GA4', 'Pixels', 'Events'] },
  { icon: Shield,           title: 'Security & Stability',             description: 'HTTPS, security headers, mixed content, console errors and broken scripts.',                      color: '#34d399', metrics: ['HTTPS', 'Headers', 'Errors'] },
  { icon: Server,           title: 'Backend Performance',              description: 'Liquid rendering efficiency, AJAX performance, app proxy delays analysis.',                        color: '#fb923c', metrics: ['Liquid Speed', 'AJAX', 'API'] },
  { icon: MonitorSmartphone,title: 'UX/UI Review',                    description: 'Visual hierarchy, typography, accessibility, navigation clarity and CTA prominence.',              color: '#e879f9', metrics: ['UX Score', 'A11y', 'Design'] },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden bg-white">
      <div className="orb w-[700px] h-[350px] bg-brand-100/80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }} className="text-center mb-20">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 mb-4">
            14 AUDIT CATEGORIES
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Every angle. <span className="gradient-text">Every insight.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Our AI engine runs 200+ checks across every critical dimension of your Shopify store.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AUDIT_CATEGORIES.map((cat, i) => (
            <motion.div key={cat.title}
              initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-200 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${cat.color}15` }}>
                <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2 leading-snug">{cat.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{cat.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.metrics.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ background: `${cat.color}10`, color: cat.color }}>
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
