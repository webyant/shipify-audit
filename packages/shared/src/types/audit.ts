export type AuditStatus = 'queued' | 'running' | 'completed' | 'failed';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ScoreGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface AuditRequest {
  url: string;
  email?: string;
}

export interface AuditScores {
  overall: number;
  performance: number;
  seo: number;
  cro: number;
  mobile: number;
  ux: number;
  security: number;
}

export interface CoreWebVitals {
  lcp: number | null;       // ms
  cls: number | null;       // score
  inp: number | null;       // ms
  ttfb: number | null;      // ms
  fcp: number | null;       // ms
  tbt: number | null;       // ms
}

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  title: string;
  description: string;
  businessImpact: string;
  technicalDetails: string;
  recommendation: string;
  severity: IssueSeverity;
  estimatedGain: string;
  revenueImpact: string;
  priority: number;
}

export type AuditCategory =
  | 'speed'
  | 'mobile'
  | 'product'
  | 'theme'
  | 'collection'
  | 'apps'
  | 'seo'
  | 'cro'
  | 'checkout'
  | 'images'
  | 'analytics'
  | 'security'
  | 'backend'
  | 'ux';

export interface SpeedData {
  score: number;
  coreWebVitals: CoreWebVitals;
  totalRequests: number;
  totalPageSize: number;        // bytes
  renderBlockingResources: number;
  jsExecutionTime: number;      // ms
  cssBlockingTime: number;      // ms
  thirdPartyRequests: number;
  cdnEnabled: boolean;
  compressionEnabled: boolean;
}

export interface SeoData {
  score: number;
  hasMetaTitle: boolean;
  metaTitleLength: number;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  headingStructure: { h1: number; h2: number; h3: number };
  hasSchemaMarkup: boolean;
  schemaTypes: string[];
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  canonicalSet: boolean;
  brokenLinks: number;
  imagesWithoutAlt: number;
  internalLinks: number;
}

export interface MobileData {
  score: number;
  isResponsive: boolean;
  hasViewportMeta: boolean;
  mobileSpeed: number;
  tapTargetIssues: number;
  fontSizeIssues: number;
  mobileUsabilityScore: number;
}

export interface SecurityData {
  score: number;
  hasHttps: boolean;
  hasMixedContent: boolean;
  securityHeaders: {
    csp: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    hsts: boolean;
  };
  consoleErrors: number;
  brokenScripts: number;
}

export interface AnalyticsData {
  hasGa4: boolean;
  hasMetaPixel: boolean;
  hasTiktokPixel: boolean;
  duplicateTracking: boolean;
  missingConversionTracking: boolean;
}

export interface AppData {
  detectedApps: DetectedApp[];
  totalAppScripts: number;
  heavyApps: string[];
  duplicateFunctionality: string[][];
}

export interface DetectedApp {
  name: string;
  scriptSize: number;  // bytes
  impact: 'low' | 'medium' | 'high';
  category: string;
}

export interface AuditResult {
  id: string;
  url: string;
  status: AuditStatus;
  createdAt: string;
  completedAt?: string;
  scores: AuditScores;
  issues: AuditIssue[];
  speed: SpeedData;
  seo: SeoData;
  mobile: MobileData;
  security: SecurityData;
  analytics: AnalyticsData;
  apps: AppData;
  revenueLeakEstimate: number;   // USD/month
  competitorBenchmarks?: CompetitorBenchmark[];
  aiInsights: AiInsight[];
}

export interface AiInsight {
  category: AuditCategory;
  headline: string;
  detail: string;
  priorityScore: number;
  revenueImpact: string;
  quickWin: boolean;
}

export interface CompetitorBenchmark {
  metric: string;
  yourScore: number;
  industryAvg: number;
  topPerformer: number;
}

export interface AuditHistoryEntry {
  id: string;
  url: string;
  createdAt: string;
  overallScore: number;
  status: AuditStatus;
}
