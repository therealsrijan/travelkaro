
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface Booking {
  id: string;
  name: string;
  category: string;
  note?: string;
  fileUrl: string;
  fileType?: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isYou?: boolean;
}

export interface TripPicture {
  id: string;
  url: string;
  uploadedBy: string; // user email
  name: string;
}

export interface Trip {
  id: string;
  tripName: string;
  destination: string;
  travelDates?: Date;
  budget?: string;
  numberOfPeople?: string;
  tripPicture?: string;
  bookings?: Booking[];
  members?: Member[];
  pictures?: TripPicture[];
}

interface TripsContextType {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'members' | 'pictures'>, userEmail: string) => Trip;
  updateTrip: (updatedTrip: Trip) => void;
  updateTripNotes: (tripId: string, bookingId: string, newNote: string) => void;
  addMember: (tripId: string, member: Omit<Member, 'id'>) => void;
  addMemberByEmail: (tripId: string, userEmail: string) => Trip | null;
  updateMember: (tripId: string, updatedMember: Member) => void;
  removeMember: (tripId: string, memberId: string) => void;
  addPicturesToTrip: (tripId: string, pictures: TripPicture[]) => void;
  removePicture: (tripId: string, pictureId: string) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedTrips = localStorage.getItem('trips');
        if (storedTrips) {
          const parsedTrips = JSON.parse(storedTrips);
          return parsedTrips.map((trip: Trip) => ({
            ...trip,
            travelDates: trip.travelDates ? new Date(trip.travelDates) : undefined,
            bookings: trip.bookings || [],
            members: trip.members || [],
            pictures: trip.pictures || [],
          }));
        }
      } catch (error) {
        console.error("Failed to parse trips from localStorage", error);
        return [];
      }
    }
    return [];
  });
  
  const { toast } = useToast();

  useEffect(() => {
     if (typeof window !== 'undefined') {
        localStorage.setItem('trips', JSON.stringify(trips));
     }
  }, [trips]);


  const addTrip = (trip: Omit<Trip, 'id' | 'members' | 'pictures'>, userEmail: string) => {
    const initialMember: Member = {
      id: new Date().toISOString() + '-you',
      name: 'You',
      email: userEmail,
      isYou: true,
      phone: '',
    };
    const newTrip = { 
      ...trip, 
      id: new Date().toISOString(), 
      bookings: trip.bookings || [],
      members: [initialMember],
      pictures: [],
    };
    setTrips(prevTrips => [...prevTrips, newTrip]);
     toast({
      title: 'Trip Created!',
      description: `Your trip to ${trip.destination} has been successfully created.`,
    });
    return newTrip;
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => (trip.id === updatedTrip.id ? updatedTrip : trip))
    );
     toast({
      title: 'Trip Updated!',
      description: `Your trip to ${updatedTrip.destination} has been successfully updated.`,
    });
  };

  const updateTripNotes = (tripId: string, bookingId: string, newNote: string) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedBookings = trip.bookings?.map(booking => {
            if (booking.id === bookingId) {
              return { ...booking, note: newNote };
            }
            return booking;
          });
          return { ...trip, bookings: updatedBookings };
        }
        return trip;
      })
    );
  };

  const addMember = (tripId: string, member: Omit<Member, 'id'>) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const newMember = { ...member, id: new Date().toISOString() };
          const updatedMembers = [...(trip.members || []), newMember];
          return { ...trip, members: updatedMembers };
        }
        return trip;
      })
    );
    toast({ title: 'Member Added', description: `${member.name} has been added to the trip.` });
  };
  
  const addMemberByEmail = (tripId: string, userEmail: string): Trip | null => {
    let targetTrip: Trip | null = null;
    setTrips(prevTrips => {
      const updatedTrips = prevTrips.map(trip => {
        if (trip.id === tripId) {
          targetTrip = trip;
          const memberExists = trip.members?.some(m => m.email === userEmail);
          if (memberExists) {
            toast({
              variant: 'destructive',
              title: 'Already a Member',
              description: 'You are already a member of this trip.',
            });
            return trip;
          }
          const newMember: Member = {
            id: new Date().toISOString(),
            name: userEmail.split('@')[0], // Default name from email
            email: userEmail,
          };
          const updatedMembers = [...(trip.members || []), newMember];
          return { ...trip, members: updatedMembers };
        }
        return trip;
      });
      return updatedTrips;
    });
     return targetTrip;
  };


  const updateMember = (tripId: string, updatedMember: Member) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedMembers = trip.members?.map(m => m.id === updatedMember.id ? updatedMember : m) || [];
          return { ...trip, members: updatedMembers };
        }
        return trip;
      })
    );
    toast({ title: 'Member Updated', description: `Details for ${updatedMember.name} have been updated.` });
  };

  const removeMember = (tripId: string, memberId: string) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const memberToRemove = trip.members?.find(m => m.id === memberId);
          if (memberToRemove?.isYou) {
            toast({ variant: 'destructive', title: 'Action Denied', description: 'You cannot remove yourself from the trip.' });
            return trip;
          }
          const updatedMembers = trip.members?.filter(m => m.id !== memberId) || [];
          toast({ title: 'Member Removed', description: `${memberToRemove?.name} has been removed from the trip.` });
          return { ...trip, members: updatedMembers };
        }
        return trip;
      })
    );
  };

  const addPicturesToTrip = (tripId: string, pictures: TripPicture[]) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedPictures = [...(trip.pictures || []), ...pictures];
          return { ...trip, pictures: updatedPictures };
        }
        return trip;
      })
    );
  };

  const removePicture = (tripId: string, pictureId: string) => {
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          const pictureToRemove = trip.pictures?.find(p => p.id === pictureId);
          const updatedPictures = trip.pictures?.filter(p => p.id !== pictureId) || [];
          toast({ 
            title: 'Picture Removed', 
            description: `${pictureToRemove?.name || 'Picture'} has been removed from the trip.` 
          });
          return { ...trip, pictures: updatedPictures };
        }
        return trip;
      })
    );
  };


  return (
    <TripsContext.Provider value={{ trips, addTrip, updateTrip, updateTripNotes, addMember, updateMember, removeMember, addMemberByEmail, addPicturesToTrip, removePicture }}>
      {children}
    </TripsContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
