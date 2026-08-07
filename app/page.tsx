import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTeacherFromCookies, getStudentFromCookies } from '@/lib/session';

export default async function HomePage() {
  const teacher = await getTeacherFromCookies();
  if (teacher) redirect('/admin');

  const student = await getStudentFromCookies();
  if (student) redirect('/student');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Ambient glow behind the hero — the one deliberate bit of motion on this page */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <span className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-data text-xs tracking-wide text-teal-400">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          QR REFRESHES EVERY 45s
        </span>

        <h1 className="text-4xl font-medium leading-tight text-slate-100 sm:text-5xl">
          Attendance, verified
          <span className="text-amber-500"> in a scan.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base font-light text-slate-400">
          A rotating QR code and a server-checked IP address stand between your roll call
          and a proxy attendance. No stale screenshots. No marking a friend in.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          <Link
            href="/login?role=teacher"
            className="group rounded-3xl border border-white/10 bg-ink-800 p-6 text-left shadow-2xl transition hover:border-amber-500/40 hover:bg-ink-700"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-xs text-slate-500">01</span>
              <span className="text-amber-500 opacity-0 transition group-hover:opacity-100">→</span>
            </div>
            <h2 className="mt-3 text-lg font-medium text-slate-100">Teacher / Admin</h2>
            <p className="mt-1 text-sm font-light text-slate-400">
              Start a live session, display the QR, review attendance, export spreadsheets.
            </p>
          </Link>

          <Link
            href="/login?role=student"
            className="group rounded-3xl border border-white/10 bg-ink-800 p-6 text-left shadow-2xl transition hover:border-teal-500/40 hover:bg-ink-700"
          >
            <div className="flex items-center justify-between">
              <span className="font-data text-xs text-slate-500">02</span>
              <span className="text-teal-400 opacity-0 transition group-hover:opacity-100">→</span>
            </div>
            <h2 className="mt-3 text-lg font-medium text-slate-100">Student</h2>
            <p className="mt-1 text-sm font-light text-slate-400">
              Log in, then scan the QR your teacher is displaying to mark yourself present.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
