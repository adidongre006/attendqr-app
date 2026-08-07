'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type Student = { id: number; rollNo: string; name: string; className: string };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch('/api/students')
      .then((r) => r.json())
      .then(setStudents);
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rollNo, name, className }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not add student');
      return;
    }
    setRollNo('');
    setName('');
    setClassName('');
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-slate-300">Add a student</h2>
        <p className="mb-4 text-xs font-light text-slate-500">
          Default password is the roll number — students should change it after first login.
        </p>
        <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-[1fr_1.5fr_1fr_auto]">
          <input
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            placeholder="Roll no."
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full name"
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
          <input
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
            placeholder="Class"
            className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500/50"
          />
          <Button type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </form>
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">
          Roster <span className="font-data text-amber-500">({students.length})</span>
        </h2>
        {students.length === 0 ? (
          <p className="font-data text-sm text-slate-500">No students yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500">
                  <th className="pb-2 font-normal">Roll No</th>
                  <th className="pb-2 font-normal">Name</th>
                  <th className="pb-2 font-normal">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 font-data text-slate-300">{s.rollNo}</td>
                    <td className="py-2.5 text-slate-200">{s.name}</td>
                    <td className="py-2.5 text-slate-400">{s.className}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
