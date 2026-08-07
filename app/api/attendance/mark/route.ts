import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { attendance, sessions } from '@/lib/schema';
import { verifyQrToken } from '@/lib/qr-token';
import { getStudentFromCookies } from '@/lib/session';
import { getClientIp } from '@/lib/get-ip';

export async function POST(req: NextRequest) {
  const student = await getStudentFromCookies();
  if (!student) {
    return NextResponse.json({ error: 'Please log in as a student first.' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Missing QR token' }, { status: 400 });

  // Step 1 — verify signature + expiry. jose's jwtVerify throws internally
  // if `exp` has passed, so an expired/reused QR is rejected right here
  // with no extra bookkeeping needed. This enforces the 45-60s QR window.
  const payload = await verifyQrToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'This QR code has expired. Ask your teacher to refresh it and scan again.' },
      { status: 410 }
    );
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, payload.sessionId))
    .limit(1);

  if (!session || !session.isActive) {
    return NextResponse.json({ error: 'This session is no longer active.' }, { status: 404 });
  }

  // Step 2 — capture the student's IP address from request headers, never
  // from anything the client claims in the request body.
  const ipAddress = getClientIp(req);

  // Step 3 — one attendance record per student per session.
  const [existing] = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.sessionId, session.id), eq(attendance.studentId, student.id)))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: 'You have already marked attendance for this session.' },
      { status: 409 }
    );
  }

  await db.insert(attendance).values({
    sessionId: session.id,
    studentId: student.id,
    ipAddress,
    attendanceDate: session.sessionDate,
  });

  // Note: we do NOT block the insert even if this IP was already used by a
  // different student in this session. Legitimate classmates on the same
  // classroom/hostel Wi-Fi can share one public IP, so an automatic block
  // would punish honest students. Instead the duplicate is flagged as a
  // review signal for the teacher — live in the session view
  // (app/api/sessions/[id]/route.ts) and yellow-highlighted in the
  // exported spreadsheet (app/api/export/route.ts).
  return NextResponse.json({ success: true, message: `Attendance marked for ${session.subject}.` });
}
