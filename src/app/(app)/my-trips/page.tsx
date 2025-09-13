'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTrips } from '@/contexts/trips-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaneTakeoff, Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { CreateTripDialog } from '@/components/create-trip-dialog';

export default function MyTripsPage() {
  const { trips } = useTrips();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-muted rounded-lg p-12">
            <PlaneTakeoff className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Trips Yet</h2>
            <p className="text-muted-foreground mt-2 mb-4">You haven't created any trips. Let's plan your next adventure!</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create a New Trip
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map((trip) => (
             <Link href={`/my-trips/${trip.id}`} key={trip.id} className="group">
                <Card className="flex flex-col h-full overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-40 w-full">
                        <Image 
                            src={trip.tripPicture || "https://placehold.co/600x400.png"} 
                            alt={trip.tripName}
                            fill
                            className="object-cover"
                            data-ai-hint="paris eiffel tower"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         <h3 className="absolute bottom-2 left-3 text-lg font-bold text-white">{trip.tripName}</h3>
                    </div>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{trip.destination}</span>
                        </div>

                        <div className="flex flex-col space-y-2">
                            {trip.travelDates && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(trip.travelDates, 'PPP')}</span>
                                </div>
                            )}
                            {trip.numberOfPeople && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{trip.numberOfPeople} Friends</span>
                                </div>
                            )}
                        </div>
                    </div>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      )}
      
      <CreateTripDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
