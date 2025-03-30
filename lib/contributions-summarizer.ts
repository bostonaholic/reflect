import { callOpenAI } from './openai.js';
import { readPrompt } from './prompt-utils.js';

export async function generateContributionsSummary(markdownContent: string, apiKey: string, model: string = 'gpt-4', debug: boolean = false): Promise<string> {
  const prompt = await readPrompt('contributions-summary');
  return callOpenAI(prompt, markdownContent, apiKey, model, debug);
} 