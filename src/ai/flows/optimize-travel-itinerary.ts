'use server';
/**
 * @fileOverview AI-powered itinerary optimization flow.
 *
 * - optimizeTravelItinerary - A function that optimizes a given travel itinerary based on user criteria.
 * - OptimizeTravelItineraryInput - The input type for the optimizeTravelItinerary function, including the original itinerary and optimization criteria.
 * - OptimizeTravelItineraryOutput - The return type for the optimizeTravelItinerary function, providing the optimized itinerary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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
  // Mock response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        optimizedItinerary: `# Optimized Travel Itinerary\n\n**Original Itinerary:**\n${input.originalItinerary}\n\n**Optimization Criteria:** ${input.optimizationCriteria}\n\n## Optimized Plan:\n\n### Day 1: Enhanced Arrival\n- Streamlined check-in process\n- Optimized local exploration route\n- Budget-friendly dining options\n\n### Day 2: Improved Attractions\n- Time-optimized attraction visits\n- Enhanced cultural experiences\n- Better shopping recommendations\n\n### Day 3: Efficient Departure\n- Optimized final day schedule\n- Strategic souvenir shopping\n- Smooth departure process\n\n*This is a mock optimized itinerary for development purposes.*`
      });
    }, 1000);
  });
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
