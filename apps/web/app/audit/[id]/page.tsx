'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AuditProgress } from '@/components/audit/AuditProgress';
import { AuditDashboard } from '@/components/audit/AuditDashboard';
import type { AuditResult } from '@shopify-audit/shared';

export default function AuditResultPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [showProgress, setShowProgress] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const poll = async () => {
      try {
        const { api } = await import('@/lib/api');
        const result = await api.getAudit(id);
        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(intervalId);
          setAudit(result);
          setShowProgress(false);
        }
      } catch {
        // ignore transient errors
      }
    };

    intervalId = setInterval(poll, 4000);
    poll();
    return () => clearInterval(intervalId);
  }, [id]);

  if (showProgress || !audit) {
    return (
      <AuditProgress
        url={id}
        onComplete={() => {
          if (audit) setShowProgress(false);
        }}
      />
    );
  }

  return <AuditDashboard audit={audit} />;
}
