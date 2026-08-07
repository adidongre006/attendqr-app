import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { attendance, sessions } from '@/lib/schema';
import { getStudentFromCookies } from '@/lib/session';

export async function GET() {
  const student = await getStudentFromCookies();
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const history = await db
    .select({
      id: attendance.id,
      subject: sessions.subject,
      className: sessions.className,
      date: attendance.attendanceDate,
      markedAt: attendance.markedAt,
    })
    .from(attendance)
    .innerJoin(sessions, eq(attendance.sessionId, sessions.id))
    .where(eq(attendance.studentId, student.id))
    .orderBy(desc(attendance.markedAt))
    .limit(100);

  return NextResponse.json({ student: { rollNo: student.rollNo, name: student.name, className: student.className }, history });
}
