import { callLlm } from './llm.js';
import { formatDateForDisplay } from './date-utils.js';
import { readPrompt } from './prompt-utils.js';
import { LlmOptions } from './types.js';

export async function generateBragDocument(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions, debug?: boolean): Promise<string> {
  const prompt = await readPrompt('brag-document');
  const content = `Time Period: From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\n\n${summary}`;
  return callLlm(prompt, content, apiKey, llmOptions, debug);
}