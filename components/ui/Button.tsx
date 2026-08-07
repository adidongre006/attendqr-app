'use client';

import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<string, string> = {
    primary: 'bg-amber-500 text-ink-950 hover:bg-amber-400 shadow-glow',
    ghost: 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
    danger: 'border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
