import { callOpenAI } from './openai.js';
import { formatDateForDisplay } from './date-utils.js';
import { readPrompt } from './prompt-utils.js';

export async function generateBragDocument(summary: string, apiKey: string, startDate: Date, endDate: Date, model: string = 'gpt-4', debug: boolean = false): Promise<string> {
  const prompt = await readPrompt('brag-document');
  const content = `Time Period: From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\n\n${summary}`;
  return callOpenAI(prompt, content, apiKey, model, debug);
} 