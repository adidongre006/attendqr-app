import { NextRequest } from 'next/server';

/**
 * Best-effort extraction of the real client IP address on Vercel/most
 * reverse-proxy setups. We deliberately read this from headers set by the
 * platform's edge network rather than trusting anything the client sends in
 * the request body — the whole point is that a student cannot spoof it.
 *
 * Note on limitations: two genuinely different students on the same
 * classroom/hostel Wi-Fi can share one public IP (NAT). That's why this
 * value is used as a *review signal* (yellow-highlighted in the exported
 * sheet) rather than an automatic block — see app/api/attendance/mark and
 * app/api/export for how it's used downstream.
 */
export function getClientIp(req: NextRequest): string {
  // Vercel / most proxies: "client, proxy1, proxy2" — first entry is the client.
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // Nginx / other reverse proxies
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // Fallback for local dev / runtimes that expose it directly (not part of
  // the typed NextRequest API in current Next versions, hence the cast).
  return (req as unknown as { ip?: string }).ip ?? 'unknown';
}
