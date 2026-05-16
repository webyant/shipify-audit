import axios from 'axios';
import type { AppData, DetectedApp } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

const APP_SIGNATURES: { name: string; pattern: RegExp; category: string; impact: DetectedApp['impact'] }[] = [
  { name: 'Klaviyo',           pattern: /klaviyo\.com/,              category: 'Email Marketing', impact: 'medium' },
  { name: 'Yotpo Reviews',     pattern: /yotpo\.com/,               category: 'Reviews',          impact: 'medium' },
  { name: 'Hotjar',            pattern: /hotjar\.com/,              category: 'Analytics',        impact: 'high' },
  { name: 'Gorgias',           pattern: /gorgias\.com/,             category: 'Support',          impact: 'low' },
  { name: 'Privy',             pattern: /privy\.com/,               category: 'Popups',           impact: 'medium' },
  { name: 'Omnisend',          pattern: /omnisend\.com/,            category: 'Email Marketing',  impact: 'medium' },
  { name: 'Attentive',         pattern: /attentive\.com/,           category: 'SMS Marketing',    impact: 'medium' },
  { name: 'Lucky Orange',      pattern: /luckyorange\.com/,         category: 'Analytics',        impact: 'high' },
  { name: 'Smile.io',          pattern: /smile\.io|smile-io/,       category: 'Loyalty',          impact: 'medium' },
  { name: 'ReCharge',          pattern: /rechargeapps\.com/,        category: 'Subscriptions',    impact: 'low' },
  { name: 'Judge.me Reviews',  pattern: /judge\.me/,                category: 'Reviews',          impact: 'low' },
  { name: 'Loox',              pattern: /loox\.io/,                 category: 'Reviews',          impact: 'medium' },
  { name: 'Zipify Pages',      pattern: /zipify\.com/,              category: 'Landing Pages',    impact: 'medium' },
  { name: 'ChatGPT Widget',    pattern: /chat-widget|intercomcdn/,  category: 'Chat',             impact: 'high' },
  { name: 'TrustPilot',        pattern: /trustpilot\.com/,          category: 'Reviews',          impact: 'medium' },
];

export async function runAppsAudit(url: string): Promise<AppData> {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'AuditIQ/1.0' },
    });

    const detectedApps: DetectedApp[] = [];

    for (const sig of APP_SIGNATURES) {
      if (sig.pattern.test(html)) {
        detectedApps.push({
          name: sig.name,
          scriptSize: estimateScriptSize(sig.impact),
          impact: sig.impact,
          category: sig.category,
        });
      }
    }

    const heavyApps = detectedApps
      .filter(a => a.impact === 'high')
      .map(a => a.name);

    // Group by category to find duplicate functionality
    const byCategory = detectedApps.reduce((acc, app) => {
      if (!acc[app.category]) acc[app.category] = [];
      acc[app.category].push(app.name);
      return acc;
    }, {} as Record<string, string[]>);

    const duplicateFunctionality = Object.values(byCategory).filter(apps => apps.length > 1);

    return {
      detectedApps,
      totalAppScripts: detectedApps.length,
      heavyApps,
      duplicateFunctionality,
    };
  } catch (err) {
    logger.error('Apps audit failed', { url, error: (err as Error).message });
    return { detectedApps: [], totalAppScripts: 0, heavyApps: [], duplicateFunctionality: [] };
  }
}

function estimateScriptSize(impact: DetectedApp['impact']): number {
  const estimates: Record<DetectedApp['impact'], number> = {
    high: 150 * 1024,
    medium: 80 * 1024,
    low: 30 * 1024,
  };
  return estimates[impact];
}
