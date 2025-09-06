'use server';

/**
 * @fileOverview Summarizes travel reviews for a given place.
 *
 * - summarizeTravelReviews - A function that summarizes user reviews and highlights essential information about hotels, attractions, or restaurants at a destination.
 * - SummarizeTravelReviewsInput - The input type for the summarizeTravelReviews function.
 * - SummarizeTravelReviewsOutput - The return type for the summarizeTravelReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTravelReviewsInputSchema = z.object({
  placeName: z.string().describe('The name of the place (hotel, attraction, or restaurant).'),
  reviews: z.string().describe('User reviews for the place.'),
});
export type SummarizeTravelReviewsInput = z.infer<typeof SummarizeTravelReviewsInputSchema>;

const SummarizeTravelReviewsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the user reviews, highlighting key information.'),
});
export type SummarizeTravelReviewsOutput = z.infer<typeof SummarizeTravelReviewsOutputSchema>;

export async function summarizeTravelReviews(input: SummarizeTravelReviewsInput): Promise<SummarizeTravelReviewsOutput> {
  return summarizeTravelReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTravelReviewsPrompt',
  input: {schema: SummarizeTravelReviewsInputSchema},
  output: {schema: SummarizeTravelReviewsOutputSchema},
  prompt: `Summarize the following user reviews for {{placeName}}, highlighting essential information to help users make informed decisions:\n\nReviews: {{reviews}}`,
});

const summarizeTravelReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeTravelReviewsFlow',
    inputSchema: SummarizeTravelReviewsInputSchema,
    outputSchema: SummarizeTravelReviewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
