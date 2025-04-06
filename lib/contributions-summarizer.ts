import { callLlm } from './llm.js';
import { readPrompt } from './prompt-utils.js';
import { LlmOptions } from './types.js';

export async function generateContributionsSummary(contributions: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const prompt = await readPrompt('contributions-summary');
  return callLlm(prompt, contributions, apiKey, llmOptions);
}