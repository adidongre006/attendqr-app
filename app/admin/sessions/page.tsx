'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Session = {
  id: number;
  className: string;
  subject: string;
  sessionDate: string;
  isActive: boolean;
};

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSessions() {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then(setSessions);
  }

  useEffect(loadSessions, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ className, subject }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not create session');
      return;
    }
    router.push(`/admin/sessions/${data.id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Start a new session</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Class, e.g. 10-A"
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Subject, e.g. Physics"
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
          <Button type="submit" disabled={creating}>
            {creating ? 'Starting…' : 'Start session'}
          </Button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">All sessions</h2>
        {sessions.length === 0 ? (
          <p className="font-data text-sm text-slate-500">Nothing yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/5">
            {sessions.map((s) => (
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
