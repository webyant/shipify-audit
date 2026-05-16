'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Zap, Crown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free', icon: Zap, price: '$0', period: 'forever',
    description: 'Get started with a single audit.', color: '#6366f1',
    features: ['1 audit per month','Overall store score','Top 10 issues','Basic SEO check','Speed score','PDF report'],
    cta: 'Start Free', popular: false,
  },
  {
    name: 'Pro', icon: Crown, price: '$49', period: 'per month',
    description: 'Full audits for growing stores.', color: '#6366f1',
    features: ['Unlimited audits','All 14 audit categories','AI-generated fixes','Revenue impact estimates','Competitor benchmarks','Audit history & trends','Weekly auto-monitoring','Email reports','Priority support'],
    cta: 'Start Pro Trial', popular: true,
  },
  {
    name: 'Agency', icon: Building2, price: '$199', period: 'per month',
    description: 'Multi-store management for agencies.', color: '#8b5cf6',
    features: ['Everything in Pro','Up to 25 stores','White-label reports','Team collaboration','API access','Custom AI rules','Slack notifications','Dedicated account manager'],
    cta: 'Contact Sales', popular: false,
  },
];

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} id="pricing" className="relative py-32 px-4 overflow-hidden bg-[#f8f9ff]">
      <div className="orb w-[600px] h-[400px] bg-violet-100/80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 mb-4">
            PRICING
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-gray-500 text-lg">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name}
              initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12 }}
              className={cn(
                'relative rounded-2xl p-8 flex flex-col transition-all duration-300',
                plan.popular
                  ? 'bg-white border-2 border-brand-400 shadow-[0_8px_40px_rgba(99,102,241,0.18)] scale-[1.02]'
                  : 'bg-white border border-gray-200 shadow-sm',
              )}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-glow-sm">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${plan.color}12` }}>
                  <plan.icon className="w-6 h-6" style={{ color: plan.color }} />
                </div>
                <h3 className="text-xl font-bold mb-1 text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-gray-400 ml-2 text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all',
                  plan.popular
                    ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:shadow-glow'
                    : 'border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600',
                )}>
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
