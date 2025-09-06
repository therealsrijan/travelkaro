'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { generateTravelItinerary } from '@/ai/flows/generate-travel-itinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Sparkles } from 'lucide-react';

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination is required.' }),
  travelDates: z.string().min(5, { message: 'Travel dates are required.' }),
  preferences: z.string().min(10, { message: 'Please describe your preferences.' }),
});

interface AiChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiChatbotDialog({ open, onOpenChange }: AiChatbotDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      travelDates: '',
      preferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setItinerary('');
    try {
      const result = await generateTravelItinerary(values);
      setItinerary(result.itinerary);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: 'Could not generate an itinerary. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset();
        setItinerary('');
        setIsLoading(false);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot />
            AI Itinerary Planner
          </DialogTitle>
          <DialogDescription>
            Tell us your travel plans, and our AI will craft a personalized itinerary for you.
          </DialogDescription>
        </DialogHeader>
        
        {!itinerary && !isLoading && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Paris, France" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="travelDates"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Travel Dates</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., July 15-22, 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Preferences & Interests</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g., Interested in museums, local food, and walking tours. Budget is moderate." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <DialogFooter>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Itinerary
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
        
        {isLoading && (
            <div className="space-y-4 py-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-20 w-full" />
            </div>
        )}

        {itinerary && !isLoading && (
            <div className="py-4 max-h-[50vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Your Personalized Itinerary:</h3>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md font-sans">
                    {itinerary}
                </pre>
                 <DialogFooter className="mt-4">
                    <Button onClick={() => setItinerary('')}>
                        Create a new one
                    </Button>
                </DialogFooter>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
