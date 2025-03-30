import { callOpenAI } from './openai.js';
import { callAnthropic } from './anthropic.js';
import { LlmOptions } from './types.js';
import chalk from 'chalk';

export async function callLlm(prompt: string, content: string, apiKey: string, llmOptions: LlmOptions, debug?: boolean): Promise<string> {
  switch (llmOptions.provider.toLowerCase()) {
    case 'openai':
      return callOpenAI(prompt, content, apiKey, llmOptions, debug);
    case 'anthropic':
      return callAnthropic(prompt, content, apiKey, llmOptions, debug);
    default:
      console.error(chalk.red(`✕ Unsupported LLM provider: ${llmOptions.provider}`));
      process.exit(1);
  }
} 