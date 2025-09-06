'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiChatbotDialog } from '@/components/ai-chatbot-dialog';
import { CreateTripDialog } from '@/components/create-trip-dialog';
import { PlusCircle, Briefcase, Users, Wand2 } from 'lucide-react';

const featureCards = [
  { 
    title: 'My Trips', 
    description: 'View and manage your existing trips.', 
    icon: Briefcase,
    href: '/my-trips'
  },
  { 
    title: 'Friends', 
    description: 'Manage your travel companions.', 
    icon: Users,
    href: '/coming-soon'
  },
  { 
    title: 'AI Planner', 
    description: 'Get a new itinerary for your next adventure.', 
    icon: Wand2,
    action: () => {} // This will be handled by isAiDialogOpen
  },
];


export default function HomePage() {
  const [isAiDialogOpen, setAiDialogOpen] = useState(false);
  const [isCreateTripDialogOpen, setCreateTripDialogOpen] = useState(false);

  const handleCardClick = (card: typeof featureCards[number]) => {
    if(card.title === 'AI Planner') {
      setAiDialogOpen(true);
    }
  };
  
  featureCards[2].action = () => setAiDialogOpen(true);


  return (
    <div className="flex flex-col">
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to TravelKaro</h1>
          <p className="text-muted-foreground mt-1">Your journey begins here. What would you like to do?</p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0" onClick={() => setCreateTripDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Trip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featureCards.map((card) => {
           const CardComponent = card.href ? Link : 'div';
           return (
            <Card 
              key={card.title} 
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col justify-between"
              onClick={() => handleCardClick(card)}
            >
              <CardComponent href={card.href || '#'}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <card.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{card.description}</p>
                </CardContent>
              </CardComponent>
            </Card>
           )
        })}
      </div>

      <AiChatbotDialog open={isAiDialogOpen} onOpenChange={setAiDialogOpen} />
      <CreateTripDialog open={isCreateTripDialogOpen} onOpenChange={setCreateTripDialogOpen} />
    </div>
  );
}
