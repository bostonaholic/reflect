import chalk from 'chalk';
import OpenAI from 'openai';
import { LlmOptions } from '../../core/types.js';
import { isDebug } from '../../utils/debug-utils.js';

export async function callOpenAI(systemMessage: string, userMessage: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    apiKey: apiKey
  });

  const response = await openai.responses.create({
    model: llmOptions.model || 'gpt-4.1',
    temperature: 0.7,
    instructions: systemMessage,
    input: userMessage,
  });

  if (response.error) {
    throw new Error(`OpenAI API error: ${response.error.message || 'Unknown error'}`);
  }

  if (isDebug()) {
    console.log(chalk.cyan('\n[DEBUG] LLM Information:'));
    console.log(chalk.yellow('[DEBUG] Input Tokens:'), chalk.white(response.usage?.input_tokens));
    console.log(chalk.yellow('[DEBUG] Output Tokens:'), chalk.white(response.usage?.output_tokens));
    console.log(chalk.yellow('[DEBUG] Total Tokens:'), chalk.white(response.usage?.total_tokens));
    console.log(chalk.yellow('[DEBUG] Cached Input Tokens:'), chalk.white(response.usage?.input_tokens_details?.cached_tokens));
    console.log(chalk.yellow('[DEBUG] Model:'), chalk.white(response.model));
    console.log(chalk.yellow('[DEBUG] Status:'), chalk.white(response.status));
  }

  return response.output_text || 'Empty response from OpenAI';
}
