import { callOpenAI } from './openai.js';
import { callAnthropic } from './anthropic.js';
import { LlmOptions, LlmProvider } from './types.js';
import chalk from 'chalk';

export const VALID_PROVIDERS = ['openai', 'anthropic'] as const;

export async function callLlm(systemMessage: string, userMessage: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const provider = llmOptions.provider.toLowerCase() as LlmProvider;

  switch (provider) {
    case 'openai':
      return callOpenAI(systemMessage, userMessage, apiKey, llmOptions);
    case 'anthropic':
      return callAnthropic(systemMessage, userMessage, apiKey, llmOptions);
  }
}