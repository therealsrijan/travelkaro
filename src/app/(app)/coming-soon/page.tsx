'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-80px)] p-4">
      <div className="relative mb-8">
        <Plane className="h-24 w-24 text-primary opacity-10 animate-bounce" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Coming Soon!
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We're working hard to bring this feature to you. Stay tuned!
      </p>
      <Button asChild className="mt-8">
        <Link href="/home">Go back to Home</Link>
      </Button>
    </div>
  );
}
