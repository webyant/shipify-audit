'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const { api } = await import('@/lib/api');
      const clean = url.trim().replace(/^https?:\/\//, '');
      const result = await api.startAudit({ url: `https://${clean}` });
      router.push(`/audit/${result.id}`);
    } catch (err) {
      setLoading(false);
      toast.error('Could not reach the audit server. Make sure the API is running on port 4000.');
    }
  };

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden bg-white">
      <div className="orb w-[700px] h-[400px] bg-brand-100/70 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 grid-pattern-light opacity-50" />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
          Start your free <span className="gradient-text">audit now</span>
        </h2>
        <p className="text-gray-500 text-lg mb-12">
          See exactly what's costing you sales. No signup required.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="relative flex items-center rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-brand-400 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="yourstore.myshopify.com"
              className="flex-1 bg-transparent pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-400 outline-none text-lg"
              disabled={loading} />
            <motion.button type="submit" disabled={loading || !url.trim()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mr-2 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-violet-600 text-white disabled:opacity-40 hover:shadow-glow transition-all">
              {loading ? <><Spinner size={16} /> Analyzing…</> : <>Audit Store <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
