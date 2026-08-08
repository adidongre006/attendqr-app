import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fira_Code } from 'next/font/google';
import './globals.css';

// Body / display face, set light-weight by default per the brief.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Utility/data face — roll numbers, timestamps, IP addresses, countdowns.
const fira = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fira',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AttendQR — Live Attendance',
  description: 'Rotating-QR attendance tracking with IP-based proxy detection.',
  icons:{
    "icon":[{
      url:"/my_logo.svg",
      sizes:"48x48"

    }],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fira.variable}`}>
      {/* <head><link rel="icon" href="/my_logo.svg" sizes='any' /></head> */}
      <body className="min-h-screen bg-ink-950 font-sans font-light text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
