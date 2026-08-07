'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LogoutButton from '@/components/LogoutButton';

type HistoryRow = { id: number; subject: string; className: string; date: string; markedAt: string };

export default function StudentPage() {
  const [student, setStudent] = useState<{ rollNo: string; name: string; className: string } | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attendance/me')
      .then((r) => r.json())
      .then((data) => {
        setStudent(data.student);
        setHistory(data.history);
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-data text-xs text-slate-500">
            {student ? student.rollNo : '—'}
          </p>
          <h1 className="text-xl font-medium text-slate-100">{student?.name ?? 'Loading…'}</h1>
          <p className="text-sm font-light text-slate-500">{student?.className}</p>
        </div>
        <LogoutButton />
      </header>

      <Link href="/scan">
        <Button className="mb-8 w-full py-3.5">Scan QR to mark attendance</Button>
      </Link>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Recent attendance</h2>

        {loading ? (
          <p className="font-data text-sm text-slate-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="font-data text-sm text-slate-500">No attendance marked yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/5">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-slate-200">{h.subject}</p>
                  <p className="font-data text-xs text-slate-500">
                    {h.date} · {new Date(h.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge tone="success">Present</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
