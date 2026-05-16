import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiInsight, AuditIssue, SpeedData, SeoData } from '@shopify-audit/shared';
import { logger } from '../../config/logger';

let geminiClient: GoogleGenerativeAI | null = null;

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return geminiClient;
}

export async function generateAiInsights(data: {
  url: string;
  issues: AuditIssue[];
  speed: SpeedData;
  seo: SeoData;
  overallScore: number;
}): Promise<AiInsight[]> {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set — returning mock AI insights');
    return generateMockInsights(data.issues);
  }

  try {
    const topIssues = data.issues.slice(0, 8).map(i => ({
      category: i.category,
      title: i.title,
      severity: i.severity,
      revenueImpact: i.revenueImpact,
    }));

    const prompt = `You are an expert Shopify CRO and performance consultant. Analyze this store audit and generate 6 precise, actionable AI insights.

Store URL: ${data.url}
Overall Score: ${data.overallScore}/100
LCP: ${data.speed.coreWebVitals.lcp ? (data.speed.coreWebVitals.lcp / 1000).toFixed(1) + 's' : 'unknown'}
Speed Score: ${data.speed.score}/100
SEO Score: ${data.seo.score}/100

Top Issues:
${topIssues.map(i => `- [${i.severity}] ${i.title} (${i.category})`).join('\n')}

Return ONLY a valid JSON object with an "insights" array of exactly 6 objects using this schema:
{
  "insights": [
    {
      "category": "speed|seo|cro|mobile|ux|security|analytics|images|checkout",
      "headline": "15-word max actionable headline",
      "detail": "2-3 sentence specific explanation with concrete numbers",
      "priorityScore": 0-100,
      "revenueImpact": "specific estimated impact like '+$3,200/mo' or '+12% CVR'",
      "quickWin": true or false
    }
  ]
}

Focus on Shopify-specific opportunities. Be specific, not generic. Include at least 2 quick wins. Return only JSON, no markdown.`;

    const model = getGemini().getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json',
      },
    });

    const raw = result.response.text();

    // Strip accidental markdown fences Gemini sometimes adds
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);
    const insights: AiInsight[] = (parsed.insights ?? parsed).slice(0, 8);
    return insights;
  } catch (err) {
    logger.error('AI insights generation failed', { error: (err as Error).message });
    return generateMockInsights(data.issues);
  }
}

function generateMockInsights(issues: AuditIssue[]): AiInsight[] {
  return [
    {
      category: 'speed',
      headline: 'Hero image WebP conversion could cut LCP by 40%',
      detail: 'Your hero banner is likely served as JPEG/PNG. Converting to WebP format with proper srcset reduces image payload by 25-35% on average. Combined with preloading, this typically brings LCP under 2.5s.',
      priorityScore: 90,
      revenueImpact: '+8% conversion rate',
      quickWin: true,
    },
    {
      category: 'seo',
      headline: 'Product schema markup missing — Rich results not eligible',
      detail: 'No JSON-LD Product schema detected on product pages. Adding price, availability, and aggregate rating schema makes your products eligible for rich snippets, which increase organic CTR by 15-30%.',
      priorityScore: 85,
      revenueImpact: '+20% organic CTR',
      quickWin: false,
    },
    {
      category: 'cro',
      headline: 'Sticky Add-to-Cart on mobile would increase ATC rate',
      detail: 'Mobile users often scroll past the ATC button. A sticky footer with the ATC button, price, and key trust badge (free shipping/returns) typically increases mobile add-to-cart rates by 12-18%.',
      priorityScore: 80,
      revenueImpact: '+12% mobile ATC rate',
      quickWin: false,
    },
    {
      category: 'analytics',
      headline: 'GA4 purchase event may be firing incorrectly',
      detail: 'Without verifying purchase event configuration, conversion data may be inaccurate. Use GA4 DebugView to confirm purchase events fire on the thank-you page with correct revenue values.',
      priorityScore: 75,
      revenueImpact: 'Accurate ROAS measurement',
      quickWin: true,
    },
    {
      category: 'images',
      headline: 'Enable lazy loading for below-the-fold product images',
      detail: 'Product collection grids loading all images eagerly wastes bandwidth for users who never scroll. Implementing native lazy loading (loading="lazy") on collection images typically saves 300-800KB on initial load.',
      priorityScore: 65,
      revenueImpact: '+0.4s faster page load',
      quickWin: true,
    },
    {
      category: 'mobile',
      headline: 'Mobile navigation needs one-tap category access',
      detail: 'Multi-level mobile navigation creates friction in the discovery funnel. Implementing a mega-menu style drawer with featured categories visible on first tap reduces navigation-related drop-offs.',
      priorityScore: 60,
      revenueImpact: '+5% mobile engagement',
      quickWin: false,
    },
  ];
}
