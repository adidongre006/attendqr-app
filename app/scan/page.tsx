import Link from 'next/link';
import { Suspense } from 'react';
import QRScanner from '@/components/QRScanner';

export default function ScanPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-xl font-medium text-slate-100">Scan to mark attendance</h1>
        <p className="mt-1 text-sm font-light text-slate-500">
          Camera access is used only to read the QR code — nothing is recorded.
        </p>
      </div>

      <Suspense fallback={null}>
        <QRScanner initialToken={searchParams.token ?? null} />
      </Suspense>

      <Link href="/student" className="font-data text-xs text-slate-500 underline underline-offset-4">
        Back to my attendance
      </Link>
    </main>
  );
}
