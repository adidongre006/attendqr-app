'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Row = { rollNo: string; name: string; className: string; subject: string; ipAddress: string; markedAt: string; suspicious: boolean };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExportPage() {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePreview() {
    setLoading(true);
    const res = await fetch(`/api/attendance?date=${date}`);
    const data = await res.json();
    setRows(res.ok ? data.rows : []);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Export attendance</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs text-slate-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 font-data text-sm text-slate-100 outline-none focus:border-amber-500/50"
            />
          </div>
          <Button variant="ghost" onClick={handlePreview} disabled={loading}>
            {loading ? 'Loading…' : 'Preview'}
          </Button>
          <a href={`/api/export?date=${date}`}>
            <Button>Download .xlsx</Button>
          </a>
        </div>
        <p className="mt-3 text-xs font-light text-slate-500">
          Rows sharing an IP address with another student that date are highlighted{' '}
          <span className="rounded bg-[#FFF176] px-1.5 py-0.5 text-ink-950">yellow</span> in the spreadsheet for
          manual review.
        </p>
      </Card>

      {rows && (
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-medium text-slate-300">
            Preview <span className="font-data text-amber-500">({rows.length} present)</span>
          </h2>
          {rows.length === 0 ? (
            <p className="font-data text-sm text-slate-500">No attendance recorded for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500">
                    <th className="pb-2 font-normal">Roll No</th>
                    <th className="pb-2 font-normal">Name</th>
                    <th className="pb-2 font-normal">Subject</th>
                    <th className="pb-2 font-normal">IP Address</th>
                    <th className="pb-2 font-normal">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((r, i) => (
                    <tr key={i} className={r.suspicious ? 'bg-amber-500/10' : ''}>
                      <td className="py-2.5 font-data text-slate-300">{r.rollNo}</td>
                      <td className="py-2.5 text-slate-200">{r.name}</td>
                      <td className="py-2.5 text-slate-400">{r.subject}</td>
                      <td className="py-2.5 font-data text-slate-400">{r.ipAddress}</td>
                      <td className="py-2.5">
                        {r.suspicious && <Badge tone="warning">Duplicate IP</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
