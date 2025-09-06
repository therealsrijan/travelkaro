import { config } from 'dotenv';
config();

import '@/ai/flows/generate-travel-itinerary.ts';
import '@/ai/flows/optimize-travel-itinerary.ts';
import '@/ai/flows/summarize-travel-reviews.ts';
import '@/ai/flows/itinerary-chatbot.ts';