import { NextResponse } from 'next/server';
import { TEACHER_COOKIE, STUDENT_COOKIE } from '@/lib/cookies';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(TEACHER_COOKIE, '', { path: '/', maxAge: 0 });
  res.cookies.set(STUDENT_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
