import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';
import { hashPassword } from '@/lib/password';

/**
 * Teacher-only: force-sets a student's password without needing the old
 * one. Meant for lockouts ("I forgot my password") — for a student
 * changing their own password with self-verification, see
 * app/api/student/change-password/route.ts instead.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const studentId = Number(params.id);
  const { newPassword } = await req.json();

  if (!newPassword || String(newPassword).length < 4) {
    return NextResponse.json({ error: 'newPassword must be at least 4 characters' }, { status: 400 });
  }

  const passwordHash = await hashPassword(String(newPassword));

  const [updated] = await db
    .update(students)
    .set({ passwordHash })
    .where(eq(students.id, studentId))
    .returning({ id: students.id, rollNo: students.rollNo });

  if (!updated) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

  return NextResponse.json({ success: true, rollNo: updated.rollNo });
}
