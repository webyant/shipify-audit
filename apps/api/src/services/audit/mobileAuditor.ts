import puppeteer from 'puppeteer';
import type { MobileData } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

export async function runMobileAudit(url: string): Promise<MobileData> {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,   // 'new' headless (default in Puppeteer 22+)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 });
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const hasViewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return !!meta;
    });

    const tapTargetIssues = await page.evaluate(() => {
      const interactive = Array.from(document.querySelectorAll('a, button, [role="button"]'));
      return interactive.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).length;
    });

    const fontSizeIssues = await page.evaluate(() => {
      const textEls = Array.from(document.querySelectorAll('p, span, a, li, td'));
      return textEls.filter(el => {
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        return size < 12;
      }).length;
    });

    const isResponsive = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth;
    });

    const score = calculateMobileScore({
      hasViewportMeta,
      isResponsive,
      tapTargetIssues,
      fontSizeIssues,
    });

    return {
      score,
      isResponsive,
      hasViewportMeta,
      mobileSpeed: score,
      tapTargetIssues,
      fontSizeIssues,
      mobileUsabilityScore: score,
    };
  } catch (err) {
    logger.error('Mobile audit failed', { url, error: (err as Error).message });
    return { score: 50, isResponsive: true, hasViewportMeta: true, mobileSpeed: 50, tapTargetIssues: 0, fontSizeIssues: 0, mobileUsabilityScore: 50 };
  } finally {
    if (browser) await browser.close();
  }
}

function calculateMobileScore(data: {
  hasViewportMeta: boolean;
  isResponsive: boolean;
  tapTargetIssues: number;
  fontSizeIssues: number;
}): number {
  let score = 100;
  if (!data.hasViewportMeta) score -= 25;
  if (!data.isResponsive) score -= 30;
  score -= Math.min(data.tapTargetIssues * 3, 25);
  score -= Math.min(data.fontSizeIssues * 2, 15);
  return Math.max(score, 0);
}
