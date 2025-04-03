import { callOpenAI } from './openai.js';
import { callAnthropic } from './anthropic.js';
import { LlmOptions, LlmProvider } from './types.js';
import chalk from 'chalk';

export const VALID_PROVIDERS = ['openai', 'anthropic'] as const;

export async function callLlm(prompt: string, content: string, apiKey: string, llmOptions: LlmOptions, debug?: boolean): Promise<string> {
  const provider = llmOptions.provider.toLowerCase() as LlmProvider;

  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, content, apiKey, llmOptions, debug);
    case 'anthropic':
      return callAnthropic(prompt, content, apiKey, llmOptions, debug);
  }
}