'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, TrendingUp, Search } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PLACEHOLDER_URLS = [
  'gymshark.com',
  'allbirds.com',
  'fashionnova.com',
  'beardbrand.com',
  'tentree.com',
];

export function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_URLS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PLACEHOLDER_URLS.length;
      setPlaceholder(PLACEHOLDER_URLS[i]);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Subtle light particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99,102,241,0.18)';
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 bg-gradient-to-b from-[#f0f1ff] via-[#f8f9ff] to-[#f8f9ff]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Soft orbs */}
      <div className="orb w-[500px] h-[500px] bg-brand-200/60 top-[-150px] left-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-violet-200/50 bottom-[-80px] right-[-80px]" />

      {/* Grid */}
      <div className="absolute inset-0 grid-pattern-light opacity-60 pointer-events-none"
        style={{ maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)' }} />

      <motion.div style={{ y: y1, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-200 text-sm text-brand-600 font-medium shadow-sm">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            AI-Powered Shopify Audits
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-gray-900">
          Get Your Shopify{' '}
          <br className="hidden sm:block" />
          <span className="gradient-text">Store Audit</span>
          <br className="hidden sm:block" />
          in{' '}
          <span className="relative inline-block">
            <span className="gradient-text-cyan">30 Seconds</span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-brand-500 rounded-full"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.8 }} />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed mb-12">
          Discover speed issues, SEO problems, CRO leaks, and revenue opportunities
          instantly. No Shopify login required.
        </motion.p>

        {/* URL Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className={cn(
            'relative flex items-center rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300',
            url && 'border-brand-400 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
          )}>
            <Search className="absolute left-4 w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder={`e.g. ${placeholder}`}
              className="flex-1 bg-transparent pl-12 pr-4 py-4 text-gray-900 placeholder:text-gray-400 outline-none text-lg"
              disabled={loading} autoComplete="off" />
            <motion.button
              type="submit" disabled={loading || !url.trim()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mr-2 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all">
              {loading ? <><Spinner size={16} /> Analyzing…</> : <>Run Free Audit <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">
            No login required · Results in under 30 seconds · 100% free
          </p>
        </motion.form>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
          {[
            { icon: TrendingUp, label: '14,000+ audits run',   color: '#10b981' },
            { icon: Shield,     label: 'SOC2-ready pipeline',  color: '#6366f1' },
            { icon: Zap,        label: 'Avg 23s audit time',   color: '#f59e0b' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-gray-400">
              <Icon className="w-4 h-4" style={{ color }} />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-brand-400/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
