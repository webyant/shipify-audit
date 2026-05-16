'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, Smartphone, Search, Shield, BarChart3, TrendingUp, Image, Server, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'connecting',  label: 'Connecting to store',         icon: Zap,       duration: 1500 },
  { id: 'speed',       label: 'Analyzing page speed',        icon: Zap,       duration: 3000 },
  { id: 'mobile',      label: 'Checking mobile UX',          icon: Smartphone, duration: 2000 },
  { id: 'seo',         label: 'Running SEO analysis',        icon: Search,    duration: 3500 },
  { id: 'security',    label: 'Security & stability scan',   icon: Shield,    duration: 2000 },
  { id: 'analytics',   label: 'Detecting analytics setup',   icon: BarChart3, duration: 1500 },
  { id: 'cro',         label: 'Evaluating CRO signals',      icon: TrendingUp,duration: 2500 },
  { id: 'images',      label: 'Checking media optimization', icon: Image,     duration: 2000 },
  { id: 'backend',     label: 'Backend performance check',   icon: Server,    duration: 1500 },
  { id: 'ai',          label: 'Generating AI insights',      icon: Zap,       duration: 4000 },
];

interface AuditProgressProps {
  url: string;
  onComplete?: () => void;
}

export function AuditProgress({ url, onComplete }: AuditProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    const advance = () => {
      if (stepIndex >= STEPS.length) { onComplete?.(); return; }
      const step = STEPS[stepIndex];
      setCurrentStep(stepIndex);
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setOverallProgress(Math.round(((stepIndex + 1) / STEPS.length) * 100));
        stepIndex++;
        advance();
      }, step.duration);
    };
    advance();
  }, [onComplete]);

  const displayUrl = url.replace(/^https?:\/\//, '');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9ff] relative overflow-hidden">
      <div className="orb w-[400px] h-[400px] bg-brand-100/80 top-[-100px] left-[-100px]" />
      <div className="orb w-[350px] h-[350px] bg-violet-100/60 bottom-[-80px] right-[-80px]" />

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-200 text-sm text-brand-600 mb-4 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            {displayUrl}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Auditing your store…</h2>
          <p className="text-gray-400 text-sm mt-2">Usually takes 20–30 seconds</p>
        </div>

        {/* Progress ring */}
        <div className="flex justify-center mb-10">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="68" fill="none" stroke="#e8eaff" strokeWidth="8" />
              <motion.circle cx="80" cy="80" r="68" fill="none" stroke="url(#progressGrad)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 68}
                animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - overallProgress / 100) }}
                transition={{ duration: 0.5 }} />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold gradient-text">{overallProgress}%</span>
              <span className="text-xs text-gray-400 mt-1">complete</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isDone = completedSteps.includes(step.id);
            const isActive = i === currentStep && !isDone;
            return (
              <motion.div key={step.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= currentStep ? 1 : 0.35, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white border border-brand-200 shadow-sm' :
                  isDone   ? 'bg-transparent' : 'bg-transparent'
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDone   ? 'bg-emerald-50' :
                  isActive ? 'bg-brand-50'   : 'bg-gray-100'
                }`}>
                  {isDone   ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                   isActive ? <Loader2 className="w-4 h-4 text-brand-500 animate-spin" /> :
                               <step.icon className="w-4 h-4 text-gray-300" />}
                </div>
                <span className={`text-sm font-medium ${
                  isDone   ? 'text-gray-400 line-through decoration-gray-300' :
                  isActive ? 'text-gray-900' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
                {isDone && (
                  <motion.span initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    className="ml-auto text-xs text-emerald-500 font-semibold">Done</motion.span>
                )}
                {isActive && (
                  <div className="ml-auto flex gap-0.5">
                    {[0,1,2].map(d => (
                      <motion.div key={d} className="w-1 h-1 rounded-full bg-brand-400"
                        animate={{ opacity: [0.3,1,0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.2 }} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
