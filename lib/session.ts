import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { teachers, students } from './schema';
import { verifyAuthToken } from './auth';
import { TEACHER_COOKIE, STUDENT_COOKIE } from './cookies';

export { TEACHER_COOKIE, STUDENT_COOKIE };

/** Reads + verifies the teacher cookie and loads the full teacher row, or null. */
export async function getTeacherFromCookies() {
  const token = cookies().get(TEACHER_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== 'teacher') return null;

  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, payload.id)).limit(1);
  return teacher ?? null;
}

/** Reads + verifies the student cookie and loads the full student row, or null. */
export async function getStudentFromCookies() {
  const token = cookies().get(STUDENT_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload || payload.role !== 'student') return null;

  const [student] = await db.select().from(students).where(eq(students.id, payload.id)).limit(1);
  return student ?? null;
}
