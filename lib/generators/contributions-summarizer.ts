import { callLlm } from '../integrations/llm/llm.js';
import { readPrompt } from '../prompts/prompt-utils.js';
import { LlmOptions } from '../core/types.js';

export async function generateContributionsSummary(contributions: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const prompt = await readPrompt('contributions-summary');
  return callLlm(prompt, contributions, apiKey, llmOptions);
}