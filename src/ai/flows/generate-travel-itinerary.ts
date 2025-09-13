'use server';
/**
 * @fileOverview Generates a personalized travel itinerary based on user preferences, destination, and travel dates.
 *
 * - generateTravelItinerary - A function that generates a travel itinerary.
 * - GenerateTravelItineraryInput - The input type for the generateTravelItinerary function.
 * - GenerateTravelItineraryOutput - The return type for the generateTravelItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTravelItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the travel itinerary.'),
  travelDates: z.string().describe('The travel dates for the itinerary.'),
  preferences: z.string().describe('The user preferences for the itinerary, such as interests, budget, and travel style.'),
});
export type GenerateTravelItineraryInput = z.infer<typeof GenerateTravelItineraryInputSchema>;

const GenerateTravelItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary.'),
});
export type GenerateTravelItineraryOutput = z.infer<typeof GenerateTravelItineraryOutputSchema>;

export async function generateTravelItinerary(input: GenerateTravelItineraryInput): Promise<GenerateTravelItineraryOutput> {
  // Mock response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        itinerary: `# Travel Itinerary for ${input.destination}\n\n**Travel Dates:** ${input.travelDates}\n**Preferences:** ${input.preferences}\n\n## Day 1: Arrival\n- Check into accommodation\n- Explore local area\n- Dinner at recommended restaurant\n\n## Day 2: Main Attractions\n- Visit top tourist spots\n- Local cultural experience\n- Shopping in local markets\n\n## Day 3: Departure\n- Final sightseeing\n- Souvenir shopping\n- Departure\n\n*This is a mock itinerary generated for development purposes.*`
      });
    }, 1000);
  });
}

const prompt = ai.definePrompt({
  name: 'generateTravelItineraryPrompt',
  input: {schema: GenerateTravelItineraryInputSchema},
  output: {schema: GenerateTravelItineraryOutputSchema},
  prompt: `You are a travel expert who generates personalized travel itineraries based on user preferences, destination, and travel dates.

  Destination: {{{destination}}}
  Travel Dates: {{{travelDates}}}
  Preferences: {{{preferences}}}

  Generate a detailed travel itinerary that includes specific activities, attractions, and dining recommendations. Consider the user's preferences and provide a balanced itinerary that caters to their interests.
  `,
});

const generateTravelItineraryFlow = ai.defineFlow(
  {
    name: 'generateTravelItineraryFlow',
    inputSchema: GenerateTravelItineraryInputSchema,
    outputSchema: GenerateTravelItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
