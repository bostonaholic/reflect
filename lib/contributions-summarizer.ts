import { callOpenAI } from './openai';
import { readPrompt } from './prompt-utils';

export async function generateContributionsSummary(markdownContent: string, apiKey: string): Promise<string> {
  const prompt = await readPrompt('contributions-summary');
  return callOpenAI(prompt, markdownContent, apiKey);
} 