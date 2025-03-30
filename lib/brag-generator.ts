import { callOpenAI } from './openai';
import { formatDateForDisplay } from './date-utils';
import { readPrompt } from './prompt-utils';

export async function generateBragDocument(summary: string, apiKey: string, startDate: Date, endDate: Date, debug: boolean = false): Promise<string> {
  const prompt = await readPrompt('brag-document');
  const content = `Time Period: From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\n\n${summary}`;
  return callOpenAI(prompt, content, apiKey, debug);
} 