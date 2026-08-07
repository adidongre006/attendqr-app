import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { attendance, students, sessions } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';

/**
 * Read-only preview of a given date's attendance, used by the export page
 * so the teacher can see exactly what the spreadsheet will contain —
 * including which rows will be highlighted — before downloading it.
 */
export async function GET(req: NextRequest) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date query param required' }, { status: 400 });

  const rows = await db
    .select({
      rollNo: students.rollNo,
      name: students.name,
      className: students.className,
      subject: sessions.subject,
      ipAddress: attendance.ipAddress,
      markedAt: attendance.markedAt,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(sessions, eq(attendance.sessionId, sessions.id))
    .where(eq(attendance.attendanceDate, date));

  // Same duplicate-IP-on-this-date logic used by the xlsx export, so the
  // preview accurately shows what will be highlighted yellow.
  const ipToRollNos = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!ipToRollNos.has(r.ipAddress)) ipToRollNos.set(r.ipAddress, new Set());
    ipToRollNos.get(r.ipAddress)!.add(r.rollNo);
  }
  const suspiciousIps = new Set(
    [...ipToRollNos.entries()].filter(([, rolls]) => rolls.size > 1).map(([ip]) => ip)
  );

  const withFlags = rows.map((r) => ({ ...r, suspicious: suspiciousIps.has(r.ipAddress) }));

  return NextResponse.json({ date, rows: withFlags, presentCount: rows.length });
}
