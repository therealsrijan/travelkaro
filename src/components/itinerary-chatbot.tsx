
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { itineraryChatbot } from '@/ai/flows/itinerary-chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bot, User, CornerDownLeft, CircleDashed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trip } from '@/contexts/trips-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  query: z.string().min(1, { message: 'Message is required.' }),
});

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface ItineraryChatbotProps {
    tripContext: Trip;
}

export function ItineraryChatbot({ tripContext }: ItineraryChatbotProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });
  
  const tripDetails = `
    Destination: ${tripContext.destination}
    Travel Dates: ${tripContext.travelDates ? format(tripContext.travelDates, 'PPP') : 'Not specified'}
    Budget: ${tripContext.budget || 'Not specified'}
    Number of People: ${tripContext.numberOfPeople || 'Not specified'}
  `;

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: `Hello! I'm your AI travel assistant for your trip to ${tripContext.tripName}. How can I help you plan your itinerary?`,
      },
    ]);
  }, [tripContext.tripName]);
  
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = { sender: 'user', text: values.query };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const result = await itineraryChatbot({ query: values.query, tripContext: tripDetails });
      const botMessage: Message = { sender: 'bot', text: result.response };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Chatbot Error',
        description: 'Could not get a response. Please try again.',
      });
      // remove user message on error
      setMessages(prev => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col relative">
        <Card className="flex-1 flex flex-col mb-0">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                    <Bot /> AI Itinerary Planner
                </CardTitle>
                <CardDescription>
                    Ask me anything about your trip to {tripContext.destination}!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden pb-20">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-start gap-3',
                                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                 {message.sender === 'bot' && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                                    </Avatar>
                                 )}
                                <div
                                    className={cn(
                                        'max-w-sm rounded-lg p-3 text-sm',
                                        message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    )}
                                >
                                    <pre className="whitespace-pre-wrap font-sans">{message.text}</pre>
                                </div>
                                 {message.sender === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                    </Avatar>
                                 )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3 text-sm">
                                    <CircleDashed className="animate-spin h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
        <div className="sticky bottom-0 p-4 bg-background border-t shadow-lg z-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                <Input
                    {...form.register('query')}
                    placeholder="e.g., What are some good restaurants near the Eiffel Tower?"
                    disabled={isLoading}
                    autoComplete="off"
                    className="flex-1"
                />
                <Button type="submit" disabled={isLoading} size="icon" className="shrink-0">
                    <CornerDownLeft />
                </Button>
            </form>
        </div>
    </div>
  );
}
