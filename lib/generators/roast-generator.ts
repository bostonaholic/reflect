import { callLlm } from '../integrations/llm/llm.js';
import { formatMonthYear } from '../utils/date-utils.js';
import { readPrompt } from '../prompts/prompt-utils.js';
import { LlmOptions } from '../core/types.js';

export async function generateRoastDocument(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  const prompt = await readPrompt('roast-document');
  const content = `Time Period: ${formatMonthYear(startDate)} - ${formatMonthYear(endDate)}\n\n${summary}`;
  return callLlm(prompt, content, apiKey, llmOptions);
}
