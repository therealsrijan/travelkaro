'use server';
/**
 * @fileOverview AI-powered itinerary optimization flow.
 *
 * - optimizeTravelItinerary - A function that optimizes a given travel itinerary based on user criteria.
 * - OptimizeTravelItineraryInput - The input type for the optimizeTravelItinerary function, including the original itinerary and optimization criteria.
 * - OptimizeTravelItineraryOutput - The return type for the optimizeTravelItinerary function, providing the optimized itinerary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeTravelItineraryInputSchema = z.object({
  originalItinerary: z.string().describe('The original travel itinerary to optimize.'),
  optimizationCriteria: z.string().describe('The criteria to use for optimization (e.g., budget, travel time, preferred activities).'),
});
export type OptimizeTravelItineraryInput = z.infer<typeof OptimizeTravelItineraryInputSchema>;

const OptimizeTravelItineraryOutputSchema = z.object({
  optimizedItinerary: z.string().describe('The optimized travel itinerary.'),
});
export type OptimizeTravelItineraryOutput = z.infer<typeof OptimizeTravelItineraryOutputSchema>;

export async function optimizeTravelItinerary(input: OptimizeTravelItineraryInput): Promise<OptimizeTravelItineraryOutput> {
  return optimizeTravelItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeTravelItineraryPrompt',
  input: {schema: OptimizeTravelItineraryInputSchema},
  output: {schema: OptimizeTravelItineraryOutputSchema},
  prompt: `You are a travel planning expert. A user has provided you with an itinerary and is looking for you to optimize the itinerary based on their specific preferences and needs. Use these requirements to modify their itinerary accordingly.

Original Itinerary: {{{originalItinerary}}}

Optimization Criteria: {{{optimizationCriteria}}}

Based on the original itinerary and optimization criteria, provide a detailed optimized itinerary that considers all preferences and needs. Make sure to explain why certain changes were made.
`,
});

const optimizeTravelItineraryFlow = ai.defineFlow(
  {
    name: 'optimizeTravelItineraryFlow',
    inputSchema: OptimizeTravelItineraryInputSchema,
    outputSchema: OptimizeTravelItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
