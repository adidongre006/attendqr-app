'use client';

import { useEffect, useRef, useState } from 'react';

const READER_ID = 'qr-reader';

type Status = { type: 'idle' | 'success' | 'error'; message: string };

export default function QRScanner({ initialToken }: { initialToken?: string | null }) {
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>({
    type: 'idle',
    message: 'Point your camera at the QR your teacher is displaying.',
  });

  async function submitToken(token: string) {
    const res = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus({ type: 'success', message: data.message });
    } else {
      setStatus({ type: 'error', message: data.error ?? 'Could not mark attendance.' });
    }
    return res.ok;
  }

  // If the student arrived here via a scanned link (?token=...), e.g. from
  // a plain phone camera app rather than the in-page scanner, submit it
  // immediately without requiring them to also open the live camera view.
  useEffect(() => {
    if (initialToken) submitToken(initialToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  useEffect(() => {
    if (initialToken) return; // link flow above already handled it

    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          async (decodedText: string) => {
            // The QR encodes a full URL (…/scan?token=xxx); pull the token
            // out of it, but also accept a raw token string as a fallback.
            let token = decodedText;
            try {
              token = new URL(decodedText).searchParams.get('token') ?? decodedText;
            } catch {
              /* not a URL — treat decodedText as the raw token */
            }

            await scanner.pause(true);
            const ok = await submitToken(token);
            if (!ok) {
              // Let the student see the error, then resume scanning in case
              // the teacher refreshes the code.
              setTimeout(() => scanner.resume(), 2000);
            }
          },
          () => {
            /* per-frame "no QR found" callback — expected constantly, ignore */
          }
        )
        .catch(() => setStatus({ type: 'error', message: 'Camera access denied or unavailable.' }));
    });

    return () => {
      cancelled = true;
      scannerRef.current?.stop?.().catch(() => {});
    };
  }, [initialToken]);

  return (
    <div className="flex flex-col items-center gap-6">
      {!initialToken && (
        <div id={READER_ID} className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10" />
      )}

      <div
        className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-center font-data text-sm ${
          status.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : status.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-white/10 bg-white/5 text-slate-400'
        }`}
      >
        {status.message}
      </div>
    </div>
  );
}
