import bcrypt from 'bcryptjs';

// Deliberately separate from lib/auth.ts (see comment there) so
// middleware.ts's edge bundle never pulls in bcryptjs. Only import this
// file from route handlers / server actions / scripts — never from
// middleware.ts or anything middleware.ts imports.

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
