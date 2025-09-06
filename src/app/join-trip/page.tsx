
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTrips } from '@/contexts/trips-context';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

function JoinTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { addMemberByEmail } = useTrips();
  const { toast } = useToast();

  const tripId = searchParams.get('tripId');

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to be determined
    }

    if (!tripId) {
      toast({
        variant: 'destructive',
        title: 'Invalid Link',
        description: 'The invitation link is missing trip information.',
      });
      router.replace('/home');
      return;
    }

    if (!user) {
      // If user is not logged in, redirect them to login
      // We store the tripId in localStorage to retrieve after login
      localStorage.setItem('pendingTripInvitation', tripId);
      router.replace('/login');
    } else {
      // User is logged in, attempt to add them to the trip
      const trip = addMemberByEmail(tripId, user.email || '');
      
      if (trip) {
        toast({
          title: 'Welcome!',
          description: `You've been added to the trip: ${trip.tripName}`,
        });
      }
      // Whether successful or not, redirect to the trip page or home
      router.replace(trip ? `/my-trips/${tripId}` : '/home');
    }
  }, [user, loading, tripId, router, addMemberByEmail, toast]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <Logo />
      <div className="mt-8 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-6">
        Joining Trip...
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Please wait while we add you to the trip.
      </p>
    </div>
  );
}


export default function JoinTripPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JoinTripContent />
        </Suspense>
    )
}
