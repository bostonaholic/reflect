import { callLlm } from '../integrations/llm/llm.js';
import { formatDateForDisplay } from '../utils/date-utils.js';
import { readPrompt } from '../prompts/prompt-utils.js';
import { LlmOptions } from '../core/types.js';

export async function generateBragDocument(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  const prompt = await readPrompt('brag-document');
  const content = `Time Period: From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\n\n${summary}`;
  return callLlm(prompt, content, apiKey, llmOptions);
}