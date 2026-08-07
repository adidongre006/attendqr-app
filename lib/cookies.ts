// Kept in their own zero-dependency file so middleware.ts (which runs on
// the Edge Runtime) can import just the cookie names without pulling in
// lib/session.ts's DB and schema imports.
export const TEACHER_COOKIE = 'teacher_token';
export const STUDENT_COOKIE = 'student_token';
