'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashLogo } from '@/components/logo';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <SplashLogo />
    </div>
  );
}
