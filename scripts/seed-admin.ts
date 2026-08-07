/**
 * Creates (or updates) the first teacher/admin account from env vars.
 * Run with: npm run seed:admin
 *
 * There is deliberately no public sign-up page — teacher accounts are
 * provisioned out-of-band (this script, or directly in the DB) so a
 * student can never self-register as a teacher.
 *
 * IMPORTANT: this script runs outside Next.js (via `tsx`), so Next's
 * automatic `.env.local` loading does NOT apply here — that only happens
 * inside `next dev` / `next build`. We load `.env.local` by hand below.
 * Everything that reads env vars (lib/db.ts, lib/password.ts) is imported
 * dynamically, AFTER that load, so it can't run before the values exist —
 * a plain top-level `import` would resolve too early and silently read
 * undefined/fallback values instead.
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.warn(
      '⚠️  No .env.local found at the project root. Falling back to whatever is already in your shell env (if anything).'
    );
    return;
  }

  for (const rawLine of readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Don't clobber anything already exported in the shell on purpose.
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  // Dynamic imports — resolved only now, after env vars are in place.
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../lib/db');
  const { teachers } = await import('../lib/schema');
  const { hashPassword } = await import('../lib/password');

  const name = process.env.SEED_TEACHER_NAME ?? 'Aditya Dongre';
  const email = (process.env.SEED_TEACHER_EMAIL ?? 'extrawork207@gmail.com').toLowerCase();
  const password = process.env.SEED_TEACHER_PASSWORD ?? '207@Extrawork';

  if (!process.env.SEED_TEACHER_EMAIL || !process.env.SEED_TEACHER_PASSWORD) {
    console.warn(
      '⚠️  SEED_TEACHER_EMAIL / SEED_TEACHER_PASSWORD not found in .env.local — using built-in defaults below. Set them in .env.local and re-run this script to use your own credentials.'
    );
  }

  const passwordHash = await hashPassword(password);

  const [existing] = await db.select().from(teachers).where(eq(teachers.email, email)).limit(1);

  if (existing) {
    await db.update(teachers).set({ name, passwordHash }).where(eq(teachers.email, email));
    console.log(`Updated existing teacher: ${email}`);
  } else {
    await db.insert(teachers).values({ name, email, passwordHash });
    console.log(`Created teacher: ${email}`);
  }

  console.log('\n--- Log in at /login with: ---');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------------\n');

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
