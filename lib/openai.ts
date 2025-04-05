import chalk from 'chalk';
import ora from 'ora';
import OpenAI from 'openai';
import { LlmOptions } from './types.js';
import { isDebug } from './debug-utils.js';

export async function callOpenAI(prompt: string, content: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const spinner = ora(chalk.cyan('Making OpenAI API request...')).start();

  try {
    const openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL || undefined,
      apiKey: apiKey
    });

    const response = await openai.responses.create({
      model: llmOptions.model || 'gpt-4o-mini',
      max_output_tokens: 1024,
      instructions: prompt,
      input: content,
    });

    if (response.error) {
      throw new Error(`OpenAI API error: ${response.error.message || 'Unknown error'}`);
    }

    spinner.succeed(chalk.green('OpenAI API request completed'));

    if (isDebug()) {
      console.log(chalk.cyan('\n[DEBUG] LLM Information:'));
      console.log(chalk.yellow('[DEBUG] Input Tokens:'), chalk.white(response.usage?.input_tokens));
      console.log(chalk.yellow('[DEBUG] Output Tokens:'), chalk.white(response.usage?.output_tokens));
      console.log(chalk.yellow('[DEBUG] Total Tokens:'), chalk.white(response.usage?.total_tokens));
      console.log(chalk.yellow('[DEBUG] Cached Input Tokens:'), chalk.white(response.usage?.input_tokens_details?.cached_tokens));
      console.log(chalk.yellow('[DEBUG] Model:'), chalk.white(response.model));
      console.log(chalk.yellow('[DEBUG] Status:'), chalk.white(response.status));
    }

    return response.output_text || '';
  } catch (error) {
    spinner.fail(chalk.red('OpenAI API request failed'));
    if (error instanceof Error) {
      console.error(chalk.red('Error message:'), error);
    }
    throw error;
  }
}