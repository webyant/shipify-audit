import { PrismaClient } from '@prisma/client';
import { runSpeedAudit } from './speedAuditor';
import { runSeoAudit } from './seoAuditor';
import { runMobileAudit } from './mobileAuditor';
import { runSecurityAudit } from './securityAuditor';
import { runAnalyticsAudit } from './analyticsAuditor';
import { runAppsAudit } from './appsAuditor';
import { generateIssues, calculateOverallScore, estimateRevenueLeak } from './issueGenerator';
import { generateAiInsights } from '../ai/aiRecommendations';
import { logger } from '../../config/logger';

const prisma = new PrismaClient();

const COMPETITOR_BENCHMARKS = [
  { metric: 'Performance Score',   industryAvg: 58, topPerformer: 88 },
  { metric: 'SEO Score',           industryAvg: 65, topPerformer: 92 },
  { metric: 'Mobile Score',        industryAvg: 55, topPerformer: 85 },
  { metric: 'LCP (s)',             industryAvg: 4.2, topPerformer: 1.8 },
  { metric: 'CRO Score',          industryAvg: 50, topPerformer: 80 },
];

export async function runAudit(auditId: string): Promise<void> {
  const audit = await prisma.audit.findUnique({ where: { id: auditId } });
  if (!audit) throw new Error(`Audit ${auditId} not found`);

  await prisma.audit.update({ where: { id: auditId }, data: { status: 'RUNNING' } });

  try {
    logger.info('Starting audit', { auditId, url: audit.url });

    // Run all auditors in parallel
    const [speed, seo, mobile, security, analytics, apps] = await Promise.allSettled([
      runSpeedAudit(audit.url),
      runSeoAudit(audit.url),
      runMobileAudit(audit.url),
      runSecurityAudit(audit.url),
      runAnalyticsAudit(audit.url),
      runAppsAudit(audit.url),
    ]);

    const speedData  = speed.status    === 'fulfilled' ? speed.value    : getFallbackSpeed();
    const seoData    = seo.status      === 'fulfilled' ? seo.value      : getFallbackSeo();
    const mobileData = mobile.status   === 'fulfilled' ? mobile.value   : getFallbackMobile();
    const securityData = security.status === 'fulfilled' ? security.value : getFallbackSecurity();
    const analyticsData = analytics.status === 'fulfilled' ? analytics.value : getFallbackAnalytics();
    const appsData   = apps.status     === 'fulfilled' ? apps.value     : getFallbackApps();

    // Compute CRO and UX scores heuristically
    const croScore = Math.round(
      (securityData.hasHttps ? 20 : 0) +
      (mobileData.isResponsive ? 20 : 0) +
      (speedData.score * 0.3) +
      (analyticsData.hasGa4 ? 10 : 0) +
      (seoData.hasSchemaMarkup ? 10 : 0)
    );
    const uxScore = Math.round(
      (mobileData.mobileUsabilityScore * 0.4) +
      (speedData.score * 0.3) +
      (seoData.headingStructure.h1 === 1 ? 30 : 0)
    );

    const scores = {
      performance: speedData.score,
      seo: seoData.score,
      cro: Math.min(croScore, 100),
      mobile: mobileData.score,
      ux: Math.min(uxScore, 100),
      security: securityData.score,
    };
    const overallScore = calculateOverallScore(scores);

    // Generate issues
    const issues = generateIssues({ speed: speedData, seo: seoData, mobile: mobileData, security: securityData, analytics: analyticsData, apps: appsData });

    // Generate AI insights
    const aiInsights = await generateAiInsights({
      url: audit.url,
      issues,
      speed: speedData,
      seo: seoData,
      overallScore,
    });

    const revenueLeakEstimate = estimateRevenueLeak(issues);

    // Competitor benchmarks
    const benchmarks = COMPETITOR_BENCHMARKS.map(b => ({
      ...b,
      yourScore: b.metric === 'LCP (s)'
        ? Math.round((speedData.coreWebVitals.lcp ?? 4000) / 1000 * 10) / 10
        : b.metric === 'Performance Score' ? scores.performance
        : b.metric === 'SEO Score' ? scores.seo
        : b.metric === 'Mobile Score' ? scores.mobile
        : scores.cro,
    }));

    // Persist everything in a transaction
    await prisma.$transaction([
      prisma.audit.update({
        where: { id: auditId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          scoreOverall: overallScore,
          scorePerformance: scores.performance,
          scoreSeo: scores.seo,
          scoreCro: scores.cro,
          scoreMobile: scores.mobile,
          scoreUx: scores.ux,
          scoreSecurity: scores.security,
          speedData: JSON.parse(JSON.stringify(speedData)),
          seoData: JSON.parse(JSON.stringify(seoData)),
          mobileData: JSON.parse(JSON.stringify(mobileData)),
          securityData: JSON.parse(JSON.stringify(securityData)),
          analyticsData: JSON.parse(JSON.stringify(analyticsData)),
          appsData: JSON.parse(JSON.stringify(appsData)),
          revenueLeakEstimate,
        },
      }),
      prisma.issue.createMany({
        data: issues.map(i => ({
          auditId,
          category: i.category,
          title: i.title,
          description: i.description,
          businessImpact: i.businessImpact,
          technicalDetails: i.technicalDetails,
          recommendation: i.recommendation,
          severity: i.severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO',
          estimatedGain: i.estimatedGain,
          revenueImpact: i.revenueImpact,
          priority: i.priority,
        })),
      }),
      prisma.aiInsight.createMany({
        data: aiInsights.map(i => ({ auditId, ...i })),
      }),
      prisma.competitorBenchmark.createMany({
        data: benchmarks.map(b => ({ auditId, ...b })),
      }),
    ]);

    logger.info('Audit completed', { auditId, overallScore, issuesCount: issues.length });
  } catch (err) {
    logger.error('Audit failed', { auditId, error: (err as Error).message });
    await prisma.audit.update({ where: { id: auditId }, data: { status: 'FAILED' } });
    throw err;
  }
}

const getFallbackSpeed = () => ({ score: 0, coreWebVitals: { lcp: null, cls: null, inp: null, ttfb: null, fcp: null, tbt: null }, totalRequests: 0, totalPageSize: 0, renderBlockingResources: 0, jsExecutionTime: 0, cssBlockingTime: 0, thirdPartyRequests: 0, cdnEnabled: false, compressionEnabled: false });
const getFallbackSeo = () => ({ score: 0, hasMetaTitle: false, metaTitleLength: 0, hasMetaDescription: false, metaDescriptionLength: 0, headingStructure: { h1: 0, h2: 0, h3: 0 }, hasSchemaMarkup: false, schemaTypes: [], hasSitemap: false, hasRobotsTxt: false, canonicalSet: false, brokenLinks: 0, imagesWithoutAlt: 0, internalLinks: 0 });
const getFallbackMobile = () => ({ score: 50, isResponsive: true, hasViewportMeta: true, mobileSpeed: 50, tapTargetIssues: 0, fontSizeIssues: 0, mobileUsabilityScore: 50 });
const getFallbackSecurity = () => ({ score: 40, hasHttps: false, hasMixedContent: false, securityHeaders: { csp: false, xFrameOptions: false, xContentTypeOptions: false, hsts: false }, consoleErrors: 0, brokenScripts: 0 });
const getFallbackAnalytics = () => ({ hasGa4: false, hasMetaPixel: false, hasTiktokPixel: false, duplicateTracking: false, missingConversionTracking: true });
const getFallbackApps = () => ({ detectedApps: [], totalAppScripts: 0, heavyApps: [], duplicateFunctionality: [] });
