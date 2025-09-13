'use server';

/**
 * @fileOverview AI-powered itinerary chatbot flow.
 *
 * - itineraryChatbot - A function that interacts with an AI chatbot to plan travel itineraries.
 * - ItineraryChatbotInput - The input type for the itineraryChatbot function, including user query.
 * - ItineraryChatbotOutput - The return type for the itineraryChatbot function, providing the chatbot's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ItineraryChatbotInputSchema = z.object({
  query: z.string().describe('The user query for planning the travel itinerary.'),
  tripContext: z.string().describe('The context of the current trip, including destination, dates, and other details.'),
});
export type ItineraryChatbotInput = z.infer<typeof ItineraryChatbotInputSchema>;

const ItineraryChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response for the user query.'),
});
export type ItineraryChatbotOutput = z.infer<typeof ItineraryChatbotOutputSchema>;

export async function itineraryChatbot(input: ItineraryChatbotInput): Promise<ItineraryChatbotOutput> {
  // Mock response for development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response: `I understand you're asking about: "${input.query}"\n\nBased on your trip context:\n${input.tripContext}\n\nHere's my recommendation:\n\nThis is a mock response for development purposes. In a real implementation, this would use AI to provide personalized travel advice based on your specific trip details and query.`
      });
    }, 1000);
  });
}

const prompt = ai.definePrompt({
  name: 'itineraryChatbotPrompt',
  input: {schema: ItineraryChatbotInputSchema},
  output: {schema: ItineraryChatbotOutputSchema},
  prompt: `You are a travel planning chatbot. Respond to the user query with a detailed travel itinerary or suggestions.
  You MUST use the provided trip context to answer the user's query.

Trip Context:
{{{tripContext}}}

User Query: {{{query}}}

Provide a comprehensive and personalized travel plan based on the user's input, considering their preferences, destination, and travel dates mentioned in the context.
`,
});

const itineraryChatbotFlow = ai.defineFlow(
  {
    name: 'itineraryChatbotFlow',
    inputSchema: ItineraryChatbotInputSchema,
    outputSchema: ItineraryChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
