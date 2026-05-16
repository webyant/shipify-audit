import * as cheerio from 'cheerio';
import axios from 'axios';
import type { SeoData } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

export async function runSeoAudit(url: string): Promise<SeoData> {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AuditIQ/1.0; +https://auditiq.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(html);

    const metaTitle = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? '';
    const canonical = $('link[rel="canonical"]').attr('href');

    // Heading structure
    const h1 = $('h1').length;
    const h2 = $('h2').length;
    const h3 = $('h3').length;

    // Images without alt
    const allImages = $('img').toArray();
    const imagesWithoutAlt = allImages.filter(el => !$(el).attr('alt')?.trim()).length;

    // Internal links
    const allLinks = $('a[href]').toArray();
    const internalLinks = allLinks.filter(el => {
      const href = $(el).attr('href') ?? '';
      return href.startsWith('/') || href.includes(new URL(url).hostname);
    }).length;

    // Schema markup detection
    const schemaScripts = $('script[type="application/ld+json"]').toArray();
    const schemaTypes: string[] = [];
    schemaScripts.forEach(el => {
      try {
        const json = JSON.parse($(el).html() ?? '{}');
        const type = json['@type'];
        if (type) schemaTypes.push(Array.isArray(type) ? type[0] : type);
      } catch { /* ignore invalid JSON */ }
    });

    // Check sitemap and robots
    const [hasSitemap, hasRobotsTxt] = await Promise.all([
      checkUrl(`${getBaseUrl(url)}/sitemap.xml`),
      checkUrl(`${getBaseUrl(url)}/robots.txt`),
    ]);

    const score = calculateSeoScore({
      hasMetaTitle: metaTitle.length > 0,
      metaTitleLength: metaTitle.length,
      hasMetaDescription: metaDescription.length > 0,
      hasSchemaMarkup: schemaTypes.length > 0,
      h1Count: h1,
      imagesWithoutAlt,
      hasSitemap,
      hasRobotsTxt,
      canonicalSet: !!canonical,
    });

    return {
      score,
      hasMetaTitle: metaTitle.length > 0,
      metaTitleLength: metaTitle.length,
      hasMetaDescription: metaDescription.length > 0,
      metaDescriptionLength: metaDescription.length,
      headingStructure: { h1, h2, h3 },
      hasSchemaMarkup: schemaTypes.length > 0,
      schemaTypes,
      hasSitemap,
      hasRobotsTxt,
      canonicalSet: !!canonical,
      brokenLinks: 0,
      imagesWithoutAlt,
      internalLinks,
    };
  } catch (err) {
    logger.error('SEO audit failed', { url, error: (err as Error).message });
    return getFallbackSeoData();
  }
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    return res.status < 400;
  } catch {
    return false;
  }
}

function getBaseUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

function calculateSeoScore(data: {
  hasMetaTitle: boolean;
  metaTitleLength: number;
  hasMetaDescription: boolean;
  hasSchemaMarkup: boolean;
  h1Count: number;
  imagesWithoutAlt: number;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  canonicalSet: boolean;
}): number {
  let score = 100;
  if (!data.hasMetaTitle) score -= 20;
  else if (data.metaTitleLength < 30 || data.metaTitleLength > 70) score -= 10;
  if (!data.hasMetaDescription) score -= 15;
  if (!data.hasSchemaMarkup) score -= 10;
  if (data.h1Count !== 1) score -= 10;
  if (data.imagesWithoutAlt > 0) score -= Math.min(data.imagesWithoutAlt * 2, 15);
  if (!data.hasSitemap) score -= 5;
  if (!data.hasRobotsTxt) score -= 5;
  if (!data.canonicalSet) score -= 5;
  return Math.max(score, 0);
}

function getFallbackSeoData(): SeoData {
  return {
    score: 0,
    hasMetaTitle: false,
    metaTitleLength: 0,
    hasMetaDescription: false,
    metaDescriptionLength: 0,
    headingStructure: { h1: 0, h2: 0, h3: 0 },
    hasSchemaMarkup: false,
    schemaTypes: [],
    hasSitemap: false,
    hasRobotsTxt: false,
    canonicalSet: false,
    brokenLinks: 0,
    imagesWithoutAlt: 0,
    internalLinks: 0,
  };
}
