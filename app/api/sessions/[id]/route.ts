import { NextRequest, NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions, attendance, students } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';

/** Returns session details plus the live list of who has checked in so far. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = Number(params.id);
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.teacherId, teacher.id)))
    .limit(1);

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const rows = await db
    .select({
      id: attendance.id,
      rollNo: students.rollNo,
      name: students.name,
      ipAddress: attendance.ipAddress,
      markedAt: attendance.markedAt,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .where(eq(attendance.sessionId, sessionId))
    .orderBy(desc(attendance.markedAt));

  // Flag rows whose IP address is shared by more than one distinct student
  // in this session — same signal used in the spreadsheet export, surfaced
  // live here so the teacher can spot it during the session itself.
  const ipCounts = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!ipCounts.has(r.ipAddress)) ipCounts.set(r.ipAddress, new Set());
    ipCounts.get(r.ipAddress)!.add(r.rollNo);
  }
  const attendees = rows.map((r) => ({
    ...r,
    suspiciousIp: (ipCounts.get(r.ipAddress)?.size ?? 0) > 1,
  }));

  return NextResponse.json({ session, attendees });
}

/** Ends a session, deactivating its QR (any future token requests 404). */
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = Number(params.id);
  const [updated] = await db
    .update(sessions)
    .set({ isActive: false, endedAt: new Date() })
    .where(and(eq(sessions.id, sessionId), eq(sessions.teacherId, teacher.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  return NextResponse.json(updated);
}
