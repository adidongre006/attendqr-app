'use client';

import { useCallback, useEffect, useState } from 'react';

export default function LiveQRDisplay({ sessionId }: { sessionId: number }) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [rotateSeconds, setRotateSeconds] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}/token`, { cache: 'no-store' });
    if (!res.ok) {
      setError('Session has ended.');
      return;
    }
    const data = await res.json();
    setQrImage(data.qrImage);
    setExpiresAt(data.expiresAt);
    setRotateSeconds(data.rotateSeconds);
    setError(null);
  }, [sessionId]);

  // Grab a QR immediately, then refresh a couple of seconds before the
  // current one actually expires so the screen is never showing a dead code.
  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, Math.max(5, rotateSeconds - 3) * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchToken]);

  // 1Hz countdown, purely visual.
  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt]);

  const progress = rotateSeconds > 0 ? secondsLeft / rotateSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-ink-800 p-8 shadow-2xl">
      <div className="relative">
        {/* Amber glow pulse behind the code, echoing the "verified" accent */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-amber-500/20 blur-2xl" />
        {qrImage ? (
          <img src={qrImage} alt="Live attendance QR code" className="h-72 w-72 rounded-2xl bg-white p-3" />
        ) : (
          <div className="h-72 w-72 animate-pulse rounded-2xl bg-white/10" />
        )}
      </div>

      {error ? (
        <p className="font-data text-sm text-red-400">{error}</p>
      ) : (
        <div className="flex w-full max-w-[220px] flex-col items-center gap-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-teal-400 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="font-data text-xs text-teal-400">
            Refreshes in {secondsLeft}s — screenshots go stale on purpose
          </span>
        </div>
      )}
    </div>
  );
}
