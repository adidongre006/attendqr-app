type Props = {
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'live';
  children: React.ReactNode;
};

const TONES: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  neutral: 'bg-white/5 text-slate-400 border-white/10',
  live: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
};

export default function Badge({ tone = 'neutral', children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-data text-xs ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
