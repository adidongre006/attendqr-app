'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/student/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not change password');
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/student'), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm p-8">
        <h1 className="text-xl font-medium text-slate-100">Change password</h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          If this is your first login, your password was your roll number.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-slate-500">Current password</label>
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-500">New password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              required
              minLength={4}
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-500">Confirm new password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              required
              minLength={4}
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              Password changed. Redirecting…
            </p>
          )}

          <Button type="submit" disabled={saving} className="mt-2 w-full">
            {saving ? 'Saving…' : 'Save new password'}
          </Button>
        </form>

        <Link href="/student" className="mt-6 block text-center font-data text-xs text-slate-500 underline underline-offset-4">
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
