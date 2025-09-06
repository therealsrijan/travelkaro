
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check for pending invitation before redirecting to home
      const pendingTripId = localStorage.getItem('pendingTripInvitation');
      if (pendingTripId) {
        localStorage.removeItem('pendingTripInvitation');
        router.replace(`/join-trip?tripId=${pendingTripId}`);
      } else {
        router.replace('/home');
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        {children}
    </main>
  );
}
