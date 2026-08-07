import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import QRCode from 'qrcode';
import { config } from "dotenv";

config({ path: ".env.local" });

import { db } from '@/lib/db';
import { sessions } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';
import { generateQrToken, QR_ROTATE_SECONDS } from '@/lib/qr-token';

/**
 * The teacher's screen (components/LiveQRDisplay.tsx) polls this endpoint
 * roughly every QR_ROTATE_SECONDS. Every call mints a brand new signed
 * token — nothing is cached or reused, so a screenshot of an old QR is
 * worthless the moment its embedded `exp` claim passes.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = Number(params.id);
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.teacherId, teacher.id)))
    .limit(1);

  if (!session || !session.isActive) {
    return NextResponse.json({ error: 'Session is not active' }, { status: 404 });
  }

  const { token, expiresAt } = await generateQrToken(sessionId);

  // Encode a full URL so the code is also scannable with a plain phone
  // camera app (which just opens the link) as well as the in-app scanner.
  const scanUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan?token=${encodeURIComponent(token)}`;
//   const origin = new URL(_req.url).origin;
// const scanUrl = `${origin}/scan?token=${encodeURIComponent(token)}`;
  const qrImage = await QRCode.toDataURL(scanUrl, {
    margin: 1,
    width: 360,
    color: { dark: '#10141F', light: '#FFFFFF' },
  });

  return NextResponse.json({ qrImage, expiresAt, rotateSeconds: QR_ROTATE_SECONDS });
}
