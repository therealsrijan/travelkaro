import React from 'react';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <div className="bg-primary text-primary-foreground p-2 rounded-lg">
      <Plane className="h-6 w-6" />
    </div>
    <span className="text-xl font-bold font-headline text-foreground">TravelKaro</span>
  </div>
);


export const SplashLogo = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-primary", className)}>
      <div className="relative flex items-center justify-center">
        <div 
          className="bg-primary/10 rounded-full border-4 border-primary/20 animate-ping absolute"
          style={{ width: '100px', height: '100px' }}
        />
        <div 
          className="bg-primary/10 text-primary p-5 rounded-full border-4 border-primary/20 relative flex items-center justify-center"
          style={{ width: '100px', height: '100px' }}
        >
          <Plane className="text-primary h-12 w-12" />
        </div>
      </div>
      <h1 className="text-4xl font-bold font-headline text-primary tracking-wider mt-4">TravelKaro</h1>
    </div>
  );
