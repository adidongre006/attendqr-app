import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { teachers, students } from '@/lib/schema';
import { signAuthToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { TEACHER_COOKIE, STUDENT_COOKIE } from '@/lib/cookies';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function POST(req: NextRequest) {
  const { role, identifier, password } = await req.json();

  if (!role || !identifier || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  if (role === 'teacher') {
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, String(identifier).toLowerCase()))
      .limit(1);

    if (!teacher || !(await verifyPassword(password, teacher.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signAuthToken({ id: teacher.id, role: 'teacher' });
    const res = NextResponse.json({ success: true, name: teacher.name });
    res.cookies.set(TEACHER_COOKIE, token, COOKIE_OPTS);
    return res;
  }

  if (role === 'student') {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.rollNo, String(identifier).toUpperCase()))
      .limit(1);

    if (!student || !(await verifyPassword(password, student.passwordHash))) {
      return NextResponse.json({ error: 'Invalid roll number or password' }, { status: 401 });
    }

    const token = await signAuthToken({ id: student.id, role: 'student' });
    const res = NextResponse.json({ success: true, name: student.name });
    res.cookies.set(STUDENT_COOKIE, token, COOKIE_OPTS);
    return res;
  }

  return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
}
