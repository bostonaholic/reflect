import { callLlm } from './llm.js';
import { readPrompt } from './prompt-utils.js';
import { LlmOptions } from './types.js';

export async function generateContributionsSummary(markdownContent: string, apiKey: string, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  const prompt = await readPrompt('contributions-summary');
  return callLlm(prompt, markdownContent, apiKey, llmOptions, debug);
} 