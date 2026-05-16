import nodemailer from 'nodemailer';
import { logger } from '../../config/logger';

interface AuditForEmail {
  id: string;
  url: string;
  scoreOverall: number;
  revenueLeakEstimate: number;
  issues: { title: string; severity: string }[];
}

export async function sendEmailReport(to: string, audit: AuditForEmail): Promise<void> {
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP not configured — skipping email send');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const criticalIssues = audit.issues.filter(i => i.severity === 'CRITICAL').slice(0, 3);
  const highIssues = audit.issues.filter(i => i.severity === 'HIGH').slice(0, 3);

  const issueRows = [...criticalIssues, ...highIssues]
    .map(i => `<tr><td style="padding:8px;color:${getSeverityColor(i.severity)};font-weight:600;">${i.severity}</td><td style="padding:8px;color:#333;">${i.title}</td></tr>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f8f8ff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">⚡ AuditIQ</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;">Your store audit is ready</p>
    </div>

    <div style="padding:32px;">
      <p style="color:#666;font-size:14px;margin-bottom:24px;">
        We've completed the audit for <strong>${audit.url}</strong>
      </p>

      <div style="display:flex;gap:16px;margin-bottom:32px;">
        <div style="flex:1;background:#f0f0ff;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:36px;font-weight:800;color:${getScoreColor(audit.scoreOverall)};">${audit.scoreOverall}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Overall Score</div>
        </div>
        <div style="flex:1;background:#fff0f0;border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#ef4444;">$${audit.revenueLeakEstimate.toLocaleString()}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Monthly Revenue Leak</div>
        </div>
      </div>

      <h3 style="color:#333;font-size:16px;margin-bottom:16px;">Top Issues Found</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${issueRows}
      </table>

      <div style="text-align:center;">
        <a href="${process.env.FRONTEND_URL}/audit/${audit.id}"
           style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
          View Full Report →
        </a>
      </div>
    </div>

    <div style="padding:20px 32px;background:#f8f8ff;text-align:center;">
      <p style="color:#aaa;font-size:12px;margin:0;">© 2026 AuditIQ · <a href="#" style="color:#aaa;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"AuditIQ" <${process.env.SMTP_FROM ?? 'hello@auditiq.app'}>`,
    to,
    subject: `Your Shopify Audit is Ready — Score: ${audit.scoreOverall}/100`,
    html,
  });

  logger.info('Email report sent', { to, auditId: audit.id });
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getSeverityColor(severity: string): string {
  const m: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };
  return m[severity] ?? '#666';
}
