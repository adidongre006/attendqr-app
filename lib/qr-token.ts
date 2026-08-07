import { SignJWT, jwtVerify } from 'jose';

const QR_SECRET = new TextEncoder().encode(
  process.env.QR_SECRET ?? 'QC12Ul9hMZR5jXSa0BwaSCWRkjY6BpaZpmJcM/HK9bCODJ03XNhTc8qqSaO1UCUD'
);

// How long a single QR code stays scannable. Default 45s, configurable via
// env so a teacher can widen it to ~60s for a large classroom without a
// code change. This is what makes screenshots/re-shares of the QR useless
// after the window closes.
export const QR_ROTATE_SECONDS = Number(process.env.QR_ROTATE_SECONDS ?? 45);

export type QrPayload = { sessionId: number };

/**
 * Generates a brand new signed token for a session, valid for exactly
 * QR_ROTATE_SECONDS. Call this fresh every time the teacher's screen asks
 * for a QR — nothing is stored in the DB, the token is entirely self
 * describing and self-expiring.
 */
export async function generateQrToken(
  sessionId: number
): Promise<{ token: string; expiresAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + QR_ROTATE_SECONDS;

  const token = await new SignJWT({ sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(QR_SECRET);

  return { token, expiresAt: exp * 1000 };
}

/**
 * Verifies a scanned token. `jwtVerify` checks the signature AND the `exp`
 * claim internally and throws if either is invalid — that single check is
 * the entire enforcement of "the QR stops working after 45-60 seconds".
 * Returns null on any failure (expired, tampered, malformed).
 */
export async function verifyQrToken(token: string): Promise<QrPayload | null> {
  try {
    const { payload } = await jwtVerify(token, QR_SECRET);
    if (typeof payload.sessionId !== 'number') return null;
    return { sessionId: payload.sessionId };
  } catch {
    return null;
  }
}
