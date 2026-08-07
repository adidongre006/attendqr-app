import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';
import { hashPassword } from '@/lib/password';

/** Lists the full student roster (teacher only). */
export async function GET() {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const list = await db
    .select({
      id: students.id,
      rollNo: students.rollNo,
      name: students.name,
      className: students.className,
      createdAt: students.createdAt,
    })
    .from(students)
    .orderBy(asc(students.rollNo));

  return NextResponse.json(list);
}

/**
 * Adds a student. If no password is supplied, defaults to the roll number
 * itself so the teacher can hand it out and have students change it later
 * (change-password flow left as a straightforward extension).
 */
export async function POST(req: NextRequest) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rollNo, name, className, password } = await req.json();
  if (!rollNo || !name || !className) {
    return NextResponse.json({ error: 'rollNo, name and className are required' }, { status: 400 });
  }

  const normalizedRollNo = String(rollNo).toUpperCase();
  const passwordHash = await hashPassword(String(password || normalizedRollNo));

  const [student] = await db
    .insert(students)
    .values({ rollNo: normalizedRollNo, name, className, passwordHash })
    .returning({ id: students.id, rollNo: students.rollNo, name: students.name, className: students.className });

  return NextResponse.json(student);
}
