'use client';

import { useRouter } from 'next/navigation';
import Button from './ui/Button';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="!px-4 !py-2 text-xs">
      Log out
    </Button>
  );
}
