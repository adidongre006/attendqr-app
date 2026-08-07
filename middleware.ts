import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { TEACHER_COOKIE, STUDENT_COOKIE } from '@/lib/cookies';

// Runs on the Edge Runtime, before any page/route in the matcher below.
// This is why lib/auth.ts uses `jose` instead of `jsonwebtoken` — jose has
// no Node `crypto` dependency and works here.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(TEACHER_COOKIE)?.value;
    const payload = token ? await verifyAuthToken(token) : null;
    if (!payload || payload.role !== 'teacher') {
      const url = new URL('/login', req.url);
      url.searchParams.set('role', 'teacher');
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/student') || pathname.startsWith('/scan')) {
    const token = req.cookies.get(STUDENT_COOKIE)?.value;
    const payload = token ? await verifyAuthToken(token) : null;
    if (!payload || payload.role !== 'student') {
      const url = new URL('/login', req.url);
      url.searchParams.set('role', 'student');
      // Preserve a scanned token (if the student tapped a QR link before
      // logging in) so we can pick the scan back up right after login.
      const qrToken = req.nextUrl.searchParams.get('token');
      if (qrToken) url.searchParams.set('token', qrToken);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/scan/:path*'],
};
