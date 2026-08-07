'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get('role') === 'student' ? 'student' : 'teacher';
  const qrToken = params.get('token'); // preserved if student was redirected mid-scan

  const [role, setRole] = useState<'teacher' | 'student'>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, identifier, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Login failed');
      return;
    }

    if (role === 'teacher') {
      router.push('/admin');
    } else {
      // If they arrived here mid-scan (redirected by middleware), send them
      // straight back to /scan with the token intact instead of the dashboard.
      router.push(qrToken ? `/scan?token=${encodeURIComponent(qrToken)}` : '/student');
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm p-8">
        {/* Role toggle */}
        <div className="mb-6 flex rounded-2xl border border-white/10 bg-ink-900 p-1">
          {(['teacher', 'student'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition ${
                role === r ? 'bg-amber-500 text-ink-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <h1 className="text-xl font-medium text-slate-100">
          {role === 'teacher' ? 'Admin sign in' : 'Student sign in'}
        </h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          {role === 'teacher' ? 'Manage sessions and attendance.' : 'Sign in to scan and mark attendance.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-slate-500">
              {role === 'teacher' ? 'Email' : 'Roll number'}
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              type={role === 'teacher' ? 'email' : 'text'}
              required
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm  text-slate-100 outline-none focus:border-amber-500/50"
              placeholder={role === 'teacher' ? 'you@school.edu' : 'e.g. CS21B045'}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-slate-500">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
