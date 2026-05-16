import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { generatePdfReport } from '../services/report/pdfGenerator';
import { sendEmailReport } from '../services/report/emailService';
import { runAudit } from '../services/audit/orchestrator';
import { logger } from '../config/logger';
import type { AuditResult, AuditHistoryEntry } from '@shopify-audit/shared';

import { QUEUE_ENABLED } from '../workers';
const USE_QUEUE = QUEUE_ENABLED;

const router = Router();
const prisma = new PrismaClient();

const StartAuditSchema = z.object({
  url: z.string().url().max(500),
  email: z.string().email().optional(),
});

// POST /api/audits — start a new audit
router.post('/', async (req, res) => {
  const parsed = StartAuditSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { url, email } = parsed.data;

  const audit = await prisma.audit.create({
    data: { id: uuidv4(), url, email, status: 'QUEUED' },
  });

  if (USE_QUEUE) {
    const { getAuditQueue } = await import('../workers');
    await getAuditQueue().add('run-audit', { auditId: audit.id }, { jobId: audit.id });
  } else {
    // Dev mode: run inline (no Redis needed)
    logger.info('Dev mode: running audit inline', { auditId: audit.id });
    runAudit(audit.id).catch(err =>
      logger.error('Inline audit failed', { auditId: audit.id, error: err.message })
    );
  }

  return res.status(201).json({ id: audit.id, status: 'queued' });
});

// GET /api/audits — list recent audits
router.get('/', async (_req, res) => {
  const audits = await prisma.audit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      url: true,
      createdAt: true,
      scoreOverall: true,
      status: true,
    },
  });

  const history: AuditHistoryEntry[] = audits.map(a => ({
    id: a.id,
    url: a.url,
    createdAt: a.createdAt.toISOString(),
    overallScore: a.scoreOverall,
    status: a.status.toLowerCase() as 'queued' | 'running' | 'completed' | 'failed',
  }));

  return res.json(history);
});

// GET /api/audits/:id — get audit result
router.get('/:id', async (req, res) => {
  const audit = await prisma.audit.findUnique({
    where: { id: req.params.id },
    include: {
      issues: { orderBy: { priority: 'desc' } },
      aiInsights: { orderBy: { priorityScore: 'desc' } },
      competitorBenchmarks: true,
    },
  });

  if (!audit) return res.status(404).json({ error: 'Audit not found' });

  const result: AuditResult = {
    id: audit.id,
    url: audit.url,
    status: audit.status.toLowerCase() as 'queued' | 'running' | 'completed' | 'failed',
    createdAt: audit.createdAt.toISOString(),
    completedAt: audit.completedAt?.toISOString(),
    scores: {
      overall: audit.scoreOverall,
      performance: audit.scorePerformance,
      seo: audit.scoreSeo,
      cro: audit.scoreCro,
      mobile: audit.scoreMobile,
      ux: audit.scoreUx,
      security: audit.scoreSecurity,
    },
    issues: audit.issues.map(i => ({
      id: i.id,
      category: i.category as AuditResult['issues'][0]['category'],
      title: i.title,
      description: i.description,
      businessImpact: i.businessImpact,
      technicalDetails: i.technicalDetails,
      recommendation: i.recommendation,
      severity: i.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low' | 'info',
      estimatedGain: i.estimatedGain,
      revenueImpact: i.revenueImpact ?? '',
      priority: i.priority,
    })),
    speed: (audit.speedData as AuditResult['speed']) ?? {} as AuditResult['speed'],
    seo: (audit.seoData as AuditResult['seo']) ?? {} as AuditResult['seo'],
    mobile: (audit.mobileData as AuditResult['mobile']) ?? {} as AuditResult['mobile'],
    security: (audit.securityData as AuditResult['security']) ?? {} as AuditResult['security'],
    analytics: (audit.analyticsData as AuditResult['analytics']) ?? {} as AuditResult['analytics'],
    apps: (audit.appsData as AuditResult['apps']) ?? {} as AuditResult['apps'],
    revenueLeakEstimate: Math.round(audit.revenueLeakEstimate),
    competitorBenchmarks: audit.competitorBenchmarks.map(b => ({
      metric: b.metric,
      yourScore: b.yourScore,
      industryAvg: b.industryAvg,
      topPerformer: b.topPerformer,
    })),
    aiInsights: audit.aiInsights.map(i => ({
      category: i.category as AuditResult['aiInsights'][0]['category'],
      headline: i.headline,
      detail: i.detail,
      priorityScore: i.priorityScore,
      revenueImpact: i.revenueImpact,
      quickWin: i.quickWin,
    })),
  };

  return res.json(result);
});

// DELETE /api/audits/:id
router.delete('/:id', async (req, res) => {
  await prisma.audit.delete({ where: { id: req.params.id } }).catch(() => {});
  return res.status(204).send();
});

// GET /api/audits/:id/export/pdf
router.get('/:id/export/pdf', async (req, res) => {
  const audit = await prisma.audit.findUnique({
    where: { id: req.params.id },
    include: { issues: { orderBy: { priority: 'desc' } }, aiInsights: true },
  });
  if (!audit) return res.status(404).json({ error: 'Audit not found' });

  const pdf = await generatePdfReport(audit as Parameters<typeof generatePdfReport>[0]);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="audit-${audit.id}.pdf"`);
  return res.send(pdf);
});

// POST /api/audits/:id/email
router.post('/:id/email', async (req, res) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const audit = await prisma.audit.findUnique({
    where: { id: req.params.id },
    include: { issues: { take: 10, orderBy: { priority: 'desc' } } },
  });
  if (!audit) return res.status(404).json({ error: 'Audit not found' });

  await sendEmailReport(email, audit as Parameters<typeof sendEmailReport>[1]);
  return res.json({ success: true });
});

export { router as auditRouter };
