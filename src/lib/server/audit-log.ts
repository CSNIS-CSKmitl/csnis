import type { RequestEvent } from '@sveltejs/kit';

let token = '';
let tokenExpires = 0;

function sourceIp(event: RequestEvent): string {
  if (process.env.TRUST_PROXY === 'true') {
    const realIp = event.request.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;
    const forwardedIp = event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwardedIp) return forwardedIp;
  }
  return event.getClientAddress();
}

async function getAdminToken(): Promise<string | null> {
  const base = process.env.PRIVATE_POCKETBASE_URL || process.env.POCKETBASE_URL || '';
  const email = process.env.PB_ADMIN_EMAIL || '';
  const password = process.env.PB_ADMIN_PASSWORD || '';
  if (!base || !email || !password) return null;
  if (token && tokenExpires > Date.now()) return token;
  const response = await fetch(`${base.replace(/\/$/, '')}/api/collections/_superusers/auth-with-password`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identity: email, password })
  });
  if (!response.ok) return null;
  const data = await response.json() as { token?: string };
  token = data.token || '';
  tokenExpires = Date.now() + 4 * 60 * 1000;
  return token || null;
}

export async function writeServiceAudit(event: RequestEvent, statusCode: number) {
  try {
    const base = process.env.PRIVATE_POCKETBASE_URL || process.env.POCKETBASE_URL || '';
    const adminToken = await getAdminToken();
    if (!base || !adminToken) return;
    await fetch(`${base.replace(/\/$/, '')}/api/collections/service_access_logs/records`, {
      method: 'POST',
      headers: { authorization: adminToken, 'content-type': 'application/json' },
      body: JSON.stringify({
        service: 'csnis', source_ip: sourceIp(event), method: event.request.method,
        path: event.url.pathname, action: event.request.method === 'GET' ? 'page_view' : 'request',
        status_code: statusCode, user_agent: event.request.headers.get('user-agent') || undefined,
        request_id: event.request.headers.get('x-request-id') || undefined, metadata: {}
      })
    });
  } catch (error) {
    console.warn('[audit] Unable to store csnis access log:', error instanceof Error ? error.message : error);
  }
}
