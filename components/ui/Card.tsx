import { HTMLAttributes } from 'react';

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-ink-800/80 backdrop-blur-xl shadow-2xl ${className}`}
      {...props}
    />
  );
}
