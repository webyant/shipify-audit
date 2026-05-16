import PDFDocument from 'pdfkit';

interface AuditForPdf {
  id: string;
  url: string;
  scoreOverall: number;
  scorePerformance: number;
  scoreSeo: number;
  scoreCro: number;
  scoreMobile: number;
  scoreSecurity: number;
  revenueLeakEstimate: number;
  createdAt: Date;
  issues: {
    title: string;
    severity: string;
    category: string;
    recommendation: string;
    revenueImpact: string | null;
  }[];
  aiInsights: {
    headline: string;
    detail: string;
    revenueImpact: string;
    quickWin: boolean;
  }[];
}

export function generatePdfReport(audit: AuditForPdf): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const BRAND = '#6366f1';
    const DARK = '#0a0a0f';
    const TEXT = '#1a1a2e';

    // ---- COVER PAGE ----
    doc.rect(0, 0, 595, 842).fill(DARK);
    doc.fillColor(BRAND).fontSize(36).font('Helvetica-Bold').text('AuditIQ', 50, 80);
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica').text('Shopify Store Audit Report', 50, 125);

    doc.fillColor('#8888aa').fontSize(11).text(`Store: ${audit.url}`, 50, 160);
    doc.text(`Generated: ${audit.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 178);
    doc.text(`Audit ID: ${audit.id}`, 50, 196);

    // Score circle (simplified)
    doc.circle(298, 380, 90).lineWidth(12).strokeColor(BRAND).stroke();
    doc.fillColor('#ffffff').fontSize(52).font('Helvetica-Bold');
    const scoreText = String(audit.scoreOverall);
    doc.text(scoreText, 298 - (scoreText.length === 2 ? 28 : 38), 345);
    doc.fillColor('#8888aa').fontSize(14).font('Helvetica').text('/100 Overall Score', 240, 415);

    // Category scores on cover
    const catScores = [
      ['Performance', audit.scorePerformance],
      ['SEO', audit.scoreSeo],
      ['CRO', audit.scoreCro],
      ['Mobile', audit.scoreMobile],
      ['Security', audit.scoreSecurity],
    ];
    let cx = 50, cy = 530;
    doc.fillColor('#8888aa').fontSize(10);
    catScores.forEach(([label, score]) => {
      doc.fillColor(getScoreColor(score as number)).fontSize(20).font('Helvetica-Bold').text(String(score), cx, cy);
      doc.fillColor('#8888aa').fontSize(8).font('Helvetica').text(label as string, cx, cy + 24);
      cx += 100;
    });

    // Revenue leak
    doc.rect(50, 620, 495, 60).fill('#1a0a0a').stroke();
    doc.fillColor('#ef4444').fontSize(22).font('Helvetica-Bold')
       .text(`$${audit.revenueLeakEstimate.toLocaleString()}/mo`, 60, 633);
    doc.fillColor('#aa5555').fontSize(10).font('Helvetica').text('Estimated monthly revenue leak from identified issues', 60, 660);

    doc.addPage();

    // ---- ISSUES PAGE ----
    doc.fillColor(TEXT).fontSize(18).font('Helvetica-Bold').text('Top Issues Found', 50, 50);
    doc.fillColor('#666').fontSize(11).font('Helvetica').text(`${audit.issues.length} total issues identified`, 50, 75);

    let y = 100;
    const topIssues = audit.issues.slice(0, 15);
    topIssues.forEach((issue, i) => {
      if (y > 750) { doc.addPage(); y = 50; }
      const color = getSeverityColor(issue.severity);
      doc.rect(50, y, 495, 46).fill('#f8f8ff');
      doc.fillColor(color).fontSize(9).font('Helvetica-Bold')
         .text(issue.severity.toUpperCase(), 60, y + 8);
      doc.fillColor('#333').fontSize(10).font('Helvetica-Bold')
         .text(issue.title, 110, y + 8, { width: 380 });
      doc.fillColor('#666').fontSize(8).font('Helvetica')
         .text(issue.recommendation, 60, y + 26, { width: 420 });
      y += 56;
    });

    doc.addPage();

    // ---- AI INSIGHTS ----
    doc.fillColor(TEXT).fontSize(18).font('Helvetica-Bold').text('AI Recommendations', 50, 50);
    y = 85;
    audit.aiInsights.slice(0, 6).forEach((insight) => {
      if (y > 720) { doc.addPage(); y = 50; }
      doc.rect(50, y, 495, 70).fill('#f0f0ff');
      doc.fillColor(BRAND).fontSize(11).font('Helvetica-Bold').text(insight.headline, 60, y + 10, { width: 380 });
      doc.fillColor('#555').fontSize(9).font('Helvetica').text(insight.detail, 60, y + 28, { width: 420 });
      if (insight.quickWin) {
        doc.fillColor('#f59e0b').fontSize(8).font('Helvetica-Bold').text('⚡ Quick Win', 60, y + 58);
      }
      doc.fillColor('#10b981').fontSize(9).font('Helvetica-Bold').text(insight.revenueImpact, 400, y + 10);
      y += 80;
    });

    doc.end();
  });
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getSeverityColor(severity: string): string {
  const m: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', info: '#818cf8' };
  return m[severity.toLowerCase()] ?? '#666';
}
