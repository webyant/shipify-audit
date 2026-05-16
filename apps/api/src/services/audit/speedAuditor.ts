import type { SpeedData, CoreWebVitals } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

export async function runSpeedAudit(url: string): Promise<SpeedData> {
  // Dynamic imports — Lighthouse 12 is ESM-only, must not be require()'d
  const chromeLauncher = await import('chrome-launcher');
  const { default: lighthouse } = await import('lighthouse');

  let chrome: Awaited<ReturnType<typeof chromeLauncher.launch>> | null = null;

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });

    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance'],
      logLevel: 'error',
      // Lighthouse 12 requires explicit formFactor / screenEmulation
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false,
      },
    });

    if (!result?.lhr) throw new Error('Lighthouse returned no results');

    const lhr   = result.lhr;
    const audits = lhr.audits ?? {};

    const coreWebVitals: CoreWebVitals = {
      lcp:  audits['largest-contentful-paint']?.numericValue  ?? null,
      cls:  audits['cumulative-layout-shift']?.numericValue   ?? null,
      inp:  audits['interaction-to-next-paint']?.numericValue ?? null,
      ttfb: audits['server-response-time']?.numericValue      ?? null,
      fcp:  audits['first-contentful-paint']?.numericValue    ?? null,
      tbt:  audits['total-blocking-time']?.numericValue       ?? null,
    };

    type NetItem = { transferSize?: number };
    const networkRequests =
      (audits['network-requests']?.details as { items?: NetItem[] })?.items ?? [];
    const totalPageSize = networkRequests.reduce((s, r) => s + (r.transferSize ?? 0), 0);

    const thirdPartyItems =
      (audits['third-party-summary']?.details as { items?: unknown[] })?.items ?? [];
    const renderBlocking =
      (audits['render-blocking-resources']?.details as { items?: unknown[] })?.items?.length ?? 0;

    return {
      score: Math.round((lhr.categories['performance']?.score ?? 0) * 100),
      coreWebVitals,
      totalRequests: networkRequests.length,
      totalPageSize,
      renderBlockingResources: renderBlocking,
      jsExecutionTime: audits['bootup-time']?.numericValue ?? 0,
      cssBlockingTime: 0,
      thirdPartyRequests: thirdPartyItems.length,
      cdnEnabled: (audits['uses-optimized-images']?.score ?? 0) > 0.5,
      compressionEnabled: (audits['uses-text-compression']?.score ?? 0) >= 0.9,
    };
  } catch (err) {
    logger.error('Speed audit failed', { url, error: (err as Error).message });
    return getFallbackSpeedData();
  } finally {
    await chrome?.kill();
  }
}

function getFallbackSpeedData(): SpeedData {
  return {
    score: 0,
    coreWebVitals: { lcp: null, cls: null, inp: null, ttfb: null, fcp: null, tbt: null },
    totalRequests: 0,
    totalPageSize: 0,
    renderBlockingResources: 0,
    jsExecutionTime: 0,
    cssBlockingTime: 0,
    thirdPartyRequests: 0,
    cdnEnabled: false,
    compressionEnabled: false,
  };
}
