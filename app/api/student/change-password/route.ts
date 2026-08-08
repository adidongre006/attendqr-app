import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';
import { getStudentFromCookies } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';

/**
 * Student-only: lets a logged-in student change their own password after
 * proving they know the current one. This is the "students should change
 * their password after first login" flow referenced on the admin roster
 * page — the default password is their roll number until they do this.
 */
export async function POST(req: NextRequest) {
  const student = await getStudentFromCookies();
  if (!student) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'currentPassword and newPassword are required' }, { status: 400 });
  }
  if (String(newPassword).length < 4) {
    return NextResponse.json({ error: 'New password must be at least 4 characters' }, { status: 400 });
  }

  const valid = await verifyPassword(currentPassword, student.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  const passwordHash = await hashPassword(String(newPassword));
  await db.update(students).set({ passwordHash }).where(eq(students.id, student.id));

  return NextResponse.json({ success: true });
}
