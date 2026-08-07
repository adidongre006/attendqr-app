import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTeacherFromCookies } from '@/lib/session';
import LogoutButton from '@/components/LogoutButton';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/export', label: 'Export' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Belt-and-braces: middleware.ts already blocks unauthenticated requests
  // to /admin/*, this is the server-component-level check for defense in depth.
  const teacher = await getTeacherFromCookies();
  if (!teacher) redirect('/login?role=teacher');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="text-sm font-medium tracking-wide text-slate-100">
              Attend<span className="text-amber-500">QR</span>
            </span>
            <nav className="hidden gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-data text-xs text-slate-500 sm:inline">{teacher.name}</span>
            <LogoutButton />
          </div>
        </div>
        {/* Mobile nav row */}
        <nav className="flex gap-1 overflow-x-auto px-6 pb-3 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-xl px-3 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
