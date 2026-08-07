import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';

/** Creates a new attendance session (a "roll call") for today. */
export async function POST(req: NextRequest) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { className, subject } = await req.json();
  if (!className || !subject) {
    return NextResponse.json({ error: 'className and subject are required' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [session] = await db
    .insert(sessions)
    .values({ teacherId: teacher.id, className, subject, sessionDate: today })
    .returning();

  return NextResponse.json(session);
}

/** Lists this teacher's sessions, most recent first. */
export async function GET() {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const list = await db
    .select()
    .from(sessions)
    .where(eq(sessions.teacherId, teacher.id))
    .orderBy(desc(sessions.startedAt));

  return NextResponse.json(list);
}
