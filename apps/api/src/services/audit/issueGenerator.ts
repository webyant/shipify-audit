import type {
  AuditIssue, SpeedData, SeoData, MobileData,
  SecurityData, AnalyticsData, AppData
} from '@shopify-audit/shared';
import { v4 as uuidv4 } from 'uuid';

export function generateIssues(data: {
  speed: SpeedData;
  seo: SeoData;
  mobile: MobileData;
  security: SecurityData;
  analytics: AnalyticsData;
  apps: AppData;
}): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // --- SPEED ISSUES ---
  const { coreWebVitals: cvw } = data.speed;

  if (cvw.lcp && cvw.lcp > 4000) {
    issues.push({
      id: uuidv4(), category: 'speed', severity: 'critical', priority: 95,
      title: 'Poor Largest Contentful Paint (LCP)',
      description: `Your LCP is ${(cvw.lcp / 1000).toFixed(1)}s — far above the 2.5s threshold.`,
      businessImpact: 'Slow LCP directly reduces conversion rates. Studies show a 1-second delay causes a 7% drop in conversions.',
      technicalDetails: 'LCP measures how long the largest element (image/text block) takes to render. Common causes: unoptimized hero images, render-blocking scripts, slow server response.',
      recommendation: 'Optimize your hero banner image (compress to WebP, max 1920px), defer non-critical JavaScript, and enable CDN caching for static assets.',
      estimatedGain: `${Math.round((cvw.lcp - 2500) / cvw.lcp * 100)}% faster perceived load`,
      revenueImpact: '+8-15% conversion recovery',
    });
  } else if (cvw.lcp && cvw.lcp > 2500) {
    issues.push({
      id: uuidv4(), category: 'speed', severity: 'high', priority: 75,
      title: 'LCP Needs Improvement',
      description: `Your LCP is ${(cvw.lcp / 1000).toFixed(1)}s. Target: under 2.5s.`,
      businessImpact: 'Borderline LCP reduces Google ranking potential and increases mobile bounce rates.',
      technicalDetails: 'LCP is a Core Web Vital used in Google rankings since 2021.',
      recommendation: 'Preload your hero image with <link rel="preload">, use WebP format, and eliminate render-blocking resources.',
      estimatedGain: '20-30% faster hero load',
      revenueImpact: '+3-5% conversion improvement',
    });
  }

  if (cvw.cls && cvw.cls > 0.25) {
    issues.push({
      id: uuidv4(), category: 'speed', severity: 'critical', priority: 88,
      title: 'Critical Cumulative Layout Shift (CLS)',
      description: `CLS score is ${cvw.cls.toFixed(3)} — above the 0.1 "Good" threshold.`,
      businessImpact: 'Layout shifts cause accidental clicks, frustrate users, and increase cart abandonment especially on mobile.',
      technicalDetails: 'CLS is caused by images/iframes without dimensions, dynamically injected content, and FOUT (Flash of Unstyled Text).',
      recommendation: 'Add explicit width/height to all images and iframes. Use CSS font-display: swap. Reserve space for dynamic content.',
      estimatedGain: 'Eliminate unexpected layout shifts',
      revenueImpact: '+5-10% mobile conversion',
    });
  }

  if (data.speed.renderBlockingResources > 0) {
    issues.push({
      id: uuidv4(), category: 'speed', severity: 'high', priority: 80,
      title: `${data.speed.renderBlockingResources} Render-Blocking Resources`,
      description: `${data.speed.renderBlockingResources} scripts or stylesheets are blocking first render.`,
      businessImpact: 'Render-blocking resources delay when your page becomes visible, directly increasing bounce rate.',
      technicalDetails: 'Scripts loaded in <head> without async/defer attributes block HTML parsing.',
      recommendation: 'Add async or defer attributes to non-critical scripts. Move critical CSS inline. Use a Shopify theme that lazy-loads app scripts.',
      estimatedGain: '0.5-2s faster first render',
      revenueImpact: '+4-8% conversion uplift',
    });
  }

  if (data.speed.totalPageSize > 5 * 1024 * 1024) {
    issues.push({
      id: uuidv4(), category: 'speed', severity: 'high', priority: 70,
      title: 'Large Total Page Size',
      description: `Total page size is ${(data.speed.totalPageSize / 1024 / 1024).toFixed(1)}MB. Target: under 2MB.`,
      businessImpact: 'Heavy pages cause slow loads on mobile data connections, increasing bounce rate.',
      technicalDetails: 'Examine large assets using browser DevTools Network tab. Focus on images and JavaScript bundles.',
      recommendation: 'Compress all images to WebP. Remove unused app scripts. Minify CSS/JS. Enable GZIP/Brotli compression.',
      estimatedGain: `${Math.round((1 - 2 / (data.speed.totalPageSize / 1024 / 1024)) * 100)}% size reduction possible`,
      revenueImpact: '+3-6% mobile revenue',
    });
  }

  // --- SEO ISSUES ---
  if (!data.seo.hasMetaTitle) {
    issues.push({
      id: uuidv4(), category: 'seo', severity: 'critical', priority: 90,
      title: 'Missing Meta Title Tag',
      description: 'No <title> tag found on the homepage.',
      businessImpact: 'Missing title tags dramatically reduce click-through rates from search results and prevent indexing.',
      technicalDetails: 'The <title> tag is the most important on-page SEO element, used by Google as the link text in search results.',
      recommendation: 'Add a descriptive title tag (50-60 characters) containing your primary keyword and brand name.',
      estimatedGain: 'Up to 40% higher CTR from search',
      revenueImpact: 'Significant organic traffic increase',
    });
  }

  if (!data.seo.hasMetaDescription) {
    issues.push({
      id: uuidv4(), category: 'seo', severity: 'high', priority: 75,
      title: 'Missing Meta Description',
      description: 'No meta description found on the homepage.',
      businessImpact: 'Without meta descriptions, Google auto-generates snippets that are often low-quality and reduce CTR.',
      technicalDetails: 'Meta descriptions (150-160 chars) appear in search results and influence click-through rate.',
      recommendation: 'Write a compelling meta description (150-160 characters) with a clear value proposition and call-to-action.',
      estimatedGain: '5-15% higher organic CTR',
      revenueImpact: '+10-20% organic traffic',
    });
  }

  if (!data.seo.hasSchemaMarkup) {
    issues.push({
      id: uuidv4(), category: 'seo', severity: 'medium', priority: 60,
      title: 'No Structured Data / Schema Markup',
      description: 'No JSON-LD schema markup detected.',
      businessImpact: 'Schema markup enables rich results (star ratings, prices, availability) in Google, increasing CTR by up to 30%.',
      technicalDetails: 'Product, Review, BreadcrumbList, and Organization schemas are critical for ecommerce SEO.',
      recommendation: 'Implement Product schema with price, availability, and reviews. Add BreadcrumbList schema to all pages.',
      estimatedGain: 'Eligible for rich snippets in search',
      revenueImpact: '+15-30% organic CTR',
    });
  }

  if (data.seo.imagesWithoutAlt > 0) {
    issues.push({
      id: uuidv4(), category: 'seo', severity: 'medium', priority: 55,
      title: `${data.seo.imagesWithoutAlt} Images Missing ALT Text`,
      description: `${data.seo.imagesWithoutAlt} images have no ALT attribute.`,
      businessImpact: 'Missing ALT text loses image search traffic and fails WCAG accessibility requirements.',
      technicalDetails: 'Google uses ALT text to understand image content for indexing and ranking.',
      recommendation: 'Add descriptive ALT text to all product images, including relevant keywords naturally.',
      estimatedGain: 'Improved image search visibility',
      revenueImpact: 'Additional image search traffic',
    });
  }

  // --- MOBILE ISSUES ---
  if (!data.mobile.hasViewportMeta) {
    issues.push({
      id: uuidv4(), category: 'mobile', severity: 'critical', priority: 92,
      title: 'Missing Viewport Meta Tag',
      description: 'The page is missing <meta name="viewport"> — it will not render correctly on mobile.',
      businessImpact: 'Without a viewport meta tag, the page renders as a desktop site on mobile, causing a terrible UX and near-zero mobile conversions.',
      technicalDetails: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>.',
      recommendation: 'Add the viewport meta tag immediately. This is a one-line fix with enormous mobile impact.',
      estimatedGain: 'Full mobile compatibility',
      revenueImpact: 'Recover all mobile conversions',
    });
  }

  if (data.mobile.tapTargetIssues > 5) {
    issues.push({
      id: uuidv4(), category: 'mobile', severity: 'medium', priority: 58,
      title: `${data.mobile.tapTargetIssues} Small Tap Targets`,
      description: 'Multiple clickable elements are smaller than the recommended 44×44px minimum.',
      businessImpact: 'Small tap targets cause misclicks, user frustration, and abandoned purchase attempts on mobile.',
      technicalDetails: 'Apple HIG and Google Material Design both recommend minimum 44×44px touch targets.',
      recommendation: 'Increase padding on navigation links, buttons, and product card CTAs to ensure minimum 44×44px touch targets.',
      estimatedGain: 'Reduced mobile UX friction',
      revenueImpact: '+2-5% mobile conversion',
    });
  }

  // --- SECURITY ISSUES ---
  if (!data.security.hasHttps) {
    issues.push({
      id: uuidv4(), category: 'security', severity: 'critical', priority: 100,
      title: 'Site Not Using HTTPS',
      description: 'Your store is serving on HTTP, not HTTPS.',
      businessImpact: 'HTTP sites show "Not Secure" in Chrome, destroying customer trust and making payment impossible. Google also penalizes non-HTTPS sites.',
      technicalDetails: 'HTTPS is required for PCI compliance. Shopify provides free SSL certificates.',
      recommendation: 'Enable HTTPS in Shopify Admin → Online Store → Domains → SSL certificate.',
      estimatedGain: 'Essential for trust & compliance',
      revenueImpact: 'Critical — impossible to process payments',
    });
  }

  if (!data.security.securityHeaders.hsts) {
    issues.push({
      id: uuidv4(), category: 'security', severity: 'medium', priority: 45,
      title: 'Missing HSTS Header',
      description: 'HTTP Strict Transport Security (HSTS) header is not set.',
      businessImpact: 'Without HSTS, connections can be downgraded to HTTP via man-in-the-middle attacks.',
      technicalDetails: 'HSTS forces browsers to always use HTTPS, preventing SSL stripping attacks.',
      recommendation: 'Contact Shopify support to enable HSTS, or configure at the CDN level.',
      estimatedGain: 'Enhanced connection security',
      revenueImpact: 'Security compliance improvement',
    });
  }

  if (data.security.hasMixedContent) {
    issues.push({
      id: uuidv4(), category: 'security', severity: 'high', priority: 72,
      title: 'Mixed Content Detected (HTTP resources on HTTPS page)',
      description: 'The HTTPS page is loading some resources over HTTP.',
      businessImpact: 'Mixed content causes browser warnings and blocks loading of insecure resources, breaking functionality.',
      technicalDetails: 'Browsers block HTTP subresources (scripts, images) on HTTPS pages in modern browsers.',
      recommendation: 'Audit all resource URLs and update HTTP references to HTTPS. Check theme assets, app scripts, and image URLs.',
      estimatedGain: 'Eliminate security warnings',
      revenueImpact: 'Prevent checkout blocking',
    });
  }

  // --- ANALYTICS ISSUES ---
  if (data.analytics.missingConversionTracking) {
    issues.push({
      id: uuidv4(), category: 'analytics', severity: 'high', priority: 78,
      title: 'No Analytics or Conversion Tracking',
      description: 'No Google Analytics 4 or Meta Pixel detected.',
      businessImpact: 'Without tracking, you cannot measure marketing ROI, identify conversion drop-offs, or optimize ad campaigns.',
      technicalDetails: 'GA4 and Meta Pixel are essential for remarketing, conversion optimization, and ROAS measurement.',
      recommendation: 'Install GA4 via Google & YouTube Shopify app. Add Meta Pixel via Meta for Shopify app. Set up purchase events.',
      estimatedGain: 'Full marketing attribution',
      revenueImpact: 'Enable profitable paid acquisition',
    });
  }

  if (data.analytics.duplicateTracking) {
    issues.push({
      id: uuidv4(), category: 'analytics', severity: 'medium', priority: 55,
      title: 'Duplicate Analytics Tracking Scripts',
      description: 'Multiple GA4 tracking IDs detected. This inflates session data.',
      businessImpact: 'Duplicate tracking corrupts your data, making conversion rates appear lower and inflating traffic metrics.',
      technicalDetails: 'GA4 fires multiple pageview events per page, skewing funnel data and attribution.',
      recommendation: 'Audit your Shopify theme code and app scripts. Remove duplicate GA4 snippet installations.',
      estimatedGain: 'Accurate analytics data',
      revenueImpact: 'Correct ROAS measurement',
    });
  }

  // --- APP ISSUES ---
  if (data.apps.heavyApps.length > 0) {
    issues.push({
      id: uuidv4(), category: 'apps', severity: 'high', priority: 76,
      title: `${data.apps.heavyApps.length} Heavy App Scripts Detected`,
      description: `Apps with high performance impact: ${data.apps.heavyApps.join(', ')}.`,
      businessImpact: 'Heavy app scripts significantly increase JavaScript parse time, slowing LCP and TBT.',
      technicalDetails: `Each heavy app adds ~100-200KB of JavaScript that must be downloaded, parsed, and executed.`,
      recommendation: 'Evaluate if these apps are actively used. Consider lightweight alternatives. Use Shopify app blocks where available.',
      estimatedGain: '0.5-1.5s load time reduction',
      revenueImpact: '+3-8% conversion from speed improvement',
    });
  }

  if (data.apps.duplicateFunctionality.length > 0) {
    data.apps.duplicateFunctionality.forEach(dupes => {
      issues.push({
        id: uuidv4(), category: 'apps', severity: 'medium', priority: 50,
        title: `Duplicate App Functionality: ${dupes.join(' & ')}`,
        description: `Both ${dupes.join(' and ')} perform overlapping functions.`,
        businessImpact: 'Duplicate functionality apps double your script weight and subscription costs with no benefit.',
        technicalDetails: 'Running two apps in the same category (e.g., two review apps) causes JS conflicts and bloated performance.',
        recommendation: `Evaluate ${dupes.join(' vs ')} and consolidate to one solution. Uninstall the unused app completely.`,
        estimatedGain: 'Reduced app conflicts',
        revenueImpact: 'Subscription cost savings + speed gain',
      });
    });
  }

  return issues.sort((a, b) => b.priority - a.priority);
}

export function calculateOverallScore(scores: {
  performance: number;
  seo: number;
  cro: number;
  mobile: number;
  ux: number;
  security: number;
}): number {
  const weights = {
    performance: 0.25,
    seo: 0.20,
    cro: 0.20,
    mobile: 0.15,
    ux: 0.10,
    security: 0.10,
  };
  return Math.round(
    Object.entries(weights).reduce((sum, [key, w]) => {
      return sum + scores[key as keyof typeof scores] * w;
    }, 0)
  );
}

export function estimateRevenueLeak(issues: AuditIssue[], estimatedMonthlyRevenue = 50000): number {
  let leakFactor = 0;
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  leakFactor += criticalCount * 0.04;
  leakFactor += highCount * 0.015;
  leakFactor = Math.min(leakFactor, 0.35);
  return Math.round(estimatedMonthlyRevenue * leakFactor);
}
