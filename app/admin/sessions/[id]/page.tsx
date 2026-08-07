'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LiveQRDisplay from '@/components/LiveQRDisplay';

type Attendee = {
  id: number;
  rollNo: string;
  name: string;
  ipAddress: string;
  markedAt: string;
  suspiciousIp: boolean;
};
type SessionDetail = {
  id: number;
  className: string;
  subject: string;
  sessionDate: string;
  isActive: boolean;
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [ending, setEnding] = useState(false);

  function refresh() {
    fetch(`/api/sessions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.session) {
          setSession(data.session);
          setAttendees(data.attendees);
        }
      });
  }

  // Poll the attendee list every 3s while the session is live so the
  // teacher sees check-ins land in near-real-time.
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEnd() {
    setEnding(true);
    await fetch(`/api/sessions/${id}`, { method: 'PATCH' });
    refresh();
    setEnding(false);
  }

  if (!session) return <p className="font-data text-sm text-slate-500">Loading…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-xl font-medium text-slate-100">
              {session.subject} · {session.className}
            </h1>
            <Badge tone={session.isActive ? 'live' : 'neutral'}>{session.isActive ? 'Live' : 'Ended'}</Badge>
          </div>
          <p className="font-data text-xs text-slate-500">{session.sessionDate}</p>
        </div>
        {session.isActive && (
          <Button variant="danger" onClick={handleEnd} disabled={ending}>
            {ending ? 'Ending…' : 'End session'}
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          {session.isActive ? (
            <LiveQRDisplay sessionId={session.id} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-ink-800 p-8 text-center">
              <p className="text-sm text-slate-400">Session ended — QR is no longer valid.</p>
            </div>
          )}
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">
              Checked in <span className="font-data text-amber-500">({attendees.length})</span>
            </h2>
            {attendees.some((a) => a.suspiciousIp) && (
              <Badge tone="warning">Duplicate IP detected</Badge>
            )}
          </div>

          {attendees.length === 0 ? (
            <p className="font-data text-sm text-slate-500">Waiting for the first scan…</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {attendees.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-slate-200">
                      {a.name} <span className="font-data text-xs text-slate-500">#{a.rollNo}</span>
                    </p>
                    <p className="font-data text-xs text-slate-500">
                      {new Date(a.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                      {a.ipAddress}
                    </p>
                  </div>
                  {a.suspiciousIp ? (
                    <Badge tone="warning">Shared IP</Badge>
                  ) : (
                    <Badge tone="success">Present</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
