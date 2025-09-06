
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, IndianRupee, Users, PlaneTakeoff, Image as ImageIcon, Edit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTrips, Trip } from '@/contexts/trips-context';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  tripName: z.string().min(2, { message: 'Trip name is required.' }),
  destination: z.string().min(2, { message: 'Destination is required.' }),
  travelDates: z.date().optional(),
  budget: z.string().optional(),
  numberOfPeople: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
}

export function CreateTripDialog({ open, onOpenChange, trip }: CreateTripDialogProps) {
  const { addTrip, updateTrip } = useTrips();
  const { user } = useAuth();
  const router = useRouter();
  const [tripPicture, setTripPicture] = useState<string | undefined>();
  const [fileName, setFileName] = useState('');

  const isEditMode = !!trip;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
      tripName: trip.tripName,
      destination: trip.destination,
      travelDates: trip.travelDates,
      budget: trip.budget,
      numberOfPeople: trip.numberOfPeople,
    } : {
      tripName: '',
      destination: '',
    },
  });

  useEffect(() => {
    if (trip) {
        form.reset({
            tripName: trip.tripName,
            destination: trip.destination,
            travelDates: trip.travelDates,
            budget: trip.budget,
            numberOfPeople: trip.numberOfPeople,
        });
        setTripPicture(trip.tripPicture);
        setFileName('');
    } else {
        form.reset({
            tripName: '',
            destination: '',
            travelDates: undefined,
            budget: '',
            numberOfPeople: '',
        });
        setTripPicture(undefined);
        setFileName('');
    }
  }, [trip, form]);
  
  const { isSubmitting } = form.formState;

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTripPicture(reader.result as string);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormValues) {
    if (isEditMode) {
        updateTrip({ ...trip, ...values, tripPicture });
    } else {
        if (user?.email) {
            const newTrip = addTrip({ ...values, tripPicture }, user.email);
            router.push(`/my-trips/${newTrip.id}`);
        }
    }
    handleOpenChange(false);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
        setTripPicture(undefined);
        setFileName('');
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? <Edit /> : <PlaneTakeoff />}
            {isEditMode ? 'Edit Trip' : 'Create a New Trip'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your trip.' : 'Tell us about your next adventure.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="tripName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer in Paris" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paris, France" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Trip Picture (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="pl-8"
                    onChange={handlePictureChange}
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              {fileName && <p className="text-sm text-muted-foreground mt-1">{fileName}</p>}
              <FormMessage />
            </FormItem>
            
            <FormField
              control={form.control}
              name="travelDates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dates (Optional)</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                           disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Budget (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., 1000" {...field} className="pl-8" type="number" disabled={isSubmitting}/>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="numberOfPeople"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Friends (Optional)</FormLabel>
                    <FormControl>
                         <div className="relative">
                            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g., 3" {...field} className="pl-8" type="number" disabled={isSubmitting} />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Trip')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
