import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default async function AdminDashboard() {
  const teacher = await getTeacherFromCookies();
  const recentSessions = teacher
    ? await db
        .select()
        .from(sessions)
        .where(eq(sessions.teacherId, teacher.id))
        .orderBy(desc(sessions.startedAt))
        .limit(6)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-medium text-slate-100">Welcome back, {teacher?.name}</h1>
        <p className="mt-1 text-sm font-light text-slate-500">Start a roll call or review recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/sessions"
          className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 transition hover:bg-amber-500/15"
        >
          <p className="text-sm font-medium text-amber-400">Start a session</p>
          <p className="mt-1 text-xs font-light text-slate-400">Display a live rotating QR</p>
        </Link>
        <Link href="/admin/students" className="rounded-3xl border border-white/10 bg-ink-800 p-5 transition hover:bg-ink-700">
          <p className="text-sm font-medium text-slate-200">Manage roster</p>
          <p className="mt-1 text-xs font-light text-slate-400">Add or review students</p>
        </Link>
        <Link href="/admin/export" className="rounded-3xl border border-white/10 bg-ink-800 p-5 transition hover:bg-ink-700">
          <p className="text-sm font-medium text-slate-200">Export attendance</p>
          <p className="mt-1 text-xs font-light text-slate-400">Pick a date, download .xlsx</p>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Recent sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="font-data text-sm text-slate-500">No sessions yet — start one above.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/5">
            {recentSessions.map((s) => (
              <li key={s.id}>
                <Link href={`/admin/sessions/${s.id}`} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-slate-200">
                      {s.subject} · {s.className}
                    </p>
                    <p className="font-data text-xs text-slate-500">{s.sessionDate}</p>
                  </div>
                  <Badge tone={s.isActive ? 'live' : 'neutral'}>{s.isActive ? 'Live' : 'Ended'}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
