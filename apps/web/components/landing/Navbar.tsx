'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['rgba(248,249,255,0)', 'rgba(255,255,255,0.95)']);
  const shadow = useTransform(scrollY, [0, 80], ['none', '0 1px 24px rgba(0,0,0,0.07)']);

  return (
    <motion.header style={{ backgroundColor: bg, boxShadow: shadow }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">AuditIQ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          {['Features', 'Pricing', 'Docs', 'Blog'].map(l => (
            <Link key={l} href={`#${l.toLowerCase()}`}
              className="hover:text-gray-900 transition-colors">
              {l}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dashboard"
            className="hidden md:block text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-sm font-semibold text-white hover:shadow-glow transition-all">
            <Zap className="w-3.5 h-3.5" />
            Free Audit
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
