import axios from 'axios';
import type { SecurityData } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

export async function runSecurityAudit(url: string): Promise<SecurityData> {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'AuditIQ/1.0' },
      validateStatus: () => true,
    });

    const headers = res.headers;
    const hasHttps = url.startsWith('https://');

    const securityHeaders = {
      csp: 'content-security-policy' in headers,
      xFrameOptions: 'x-frame-options' in headers,
      xContentTypeOptions: 'x-content-type-options' in headers,
      hsts: 'strict-transport-security' in headers,
    };

    const html = res.data as string;
    const hasMixedContent = hasHttps && /http:\/\//.test(html);

    const score = calculateSecurityScore({ hasHttps, securityHeaders, hasMixedContent });

    return {
      score,
      hasHttps,
      hasMixedContent,
      securityHeaders,
      consoleErrors: 0,
      brokenScripts: 0,
    };
  } catch (err) {
    logger.error('Security audit failed', { url, error: (err as Error).message });
    return {
      score: 40,
      hasHttps: url.startsWith('https://'),
      hasMixedContent: false,
      securityHeaders: { csp: false, xFrameOptions: false, xContentTypeOptions: false, hsts: false },
      consoleErrors: 0,
      brokenScripts: 0,
    };
  }
}

function calculateSecurityScore(data: {
  hasHttps: boolean;
  securityHeaders: { csp: boolean; xFrameOptions: boolean; xContentTypeOptions: boolean; hsts: boolean };
  hasMixedContent: boolean;
}): number {
  let score = 100;
  if (!data.hasHttps) score -= 40;
  if (!data.securityHeaders.csp) score -= 15;
  if (!data.securityHeaders.hsts) score -= 15;
  if (!data.securityHeaders.xFrameOptions) score -= 10;
  if (!data.securityHeaders.xContentTypeOptions) score -= 10;
  if (data.hasMixedContent) score -= 20;
  return Math.max(score, 0);
}
