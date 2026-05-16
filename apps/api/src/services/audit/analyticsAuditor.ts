import axios from 'axios';
import type { AnalyticsData } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

export async function runAnalyticsAudit(url: string): Promise<AnalyticsData> {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'AuditIQ/1.0' },
    });

    const hasGa4 = /gtag\s*\(\s*['"]config['"]|googletagmanager\.com\/gtm\.js|G-[A-Z0-9]+/.test(html);
    const hasMetaPixel = /connect\.facebook\.net|fbevents\.js|fbq\s*\(/.test(html);
    const hasTiktokPixel = /analytics\.tiktok\.com|ttq\s*\./.test(html);

    // Detect duplicate tracking (multiple GA4 IDs)
    const ga4Matches = (html.match(/G-[A-Z0-9]{8,}/g) ?? []);
    const duplicateTracking = ga4Matches.length > 1;

    const missingConversionTracking = !hasGa4 && !hasMetaPixel;

    return {
      hasGa4,
      hasMetaPixel,
      hasTiktokPixel,
      duplicateTracking,
      missingConversionTracking,
    };
  } catch (err) {
    logger.error('Analytics audit failed', { url, error: (err as Error).message });
    return {
      hasGa4: false,
      hasMetaPixel: false,
      hasTiktokPixel: false,
      duplicateTracking: false,
      missingConversionTracking: true,
    };
  }
}
