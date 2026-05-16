import type { AuditResult, AuditRequest, AuditHistoryEntry } from '@shopify-audit/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  startAudit: (body: AuditRequest) =>
    request<{ id: string; status: string }>('/api/audits', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAudit: (id: string) =>
    request<AuditResult>(`/api/audits/${id}`),

  getHistory: () =>
    request<AuditHistoryEntry[]>('/api/audits'),

  deleteAudit: (id: string) =>
    request<void>(`/api/audits/${id}`, { method: 'DELETE' }),

  exportPdf: (id: string) =>
    fetch(`${API_BASE}/api/audits/${id}/export/pdf`).then(r => r.blob()),

  sendEmailReport: (id: string, email: string) =>
    request<void>(`/api/audits/${id}/email`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};
