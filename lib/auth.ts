import { SignJWT, jwtVerify } from 'jose';

// This file is imported by middleware.ts, which runs on the Edge Runtime.
// It must stay free of Node-only dependencies (like bcryptjs) — password
// hashing lives in lib/password.ts instead, imported only by route
// handlers that never run at the edge.
const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'FhDgX0JcAE2dmxTy/eehdxdPxw4BWnN6FRmn2O3qsB5tJuDLY+GQv/KqqrRXaWpX'
);

export type AuthPayload = { id: number; role: 'teacher' | 'student' };

/** Signs a 7-day login session token for a teacher or student. */
export async function signAuthToken(payload: AuthPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(AUTH_SECRET);
}

/** Verifies a login session token. Returns null if invalid or expired. */
export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}
