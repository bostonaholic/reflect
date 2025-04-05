import chalk from 'chalk';
import ora from 'ora';
import Anthropic from '@anthropic-ai/sdk';
import { LlmOptions } from './types.js';
import { isDebug } from './debug-utils.js';

export async function callAnthropic(systemMessage: string, userMessage: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const spinner = ora(chalk.cyan('Making Anthropic API request...')).start();

  try {
    const anthropic = new Anthropic({
      baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: llmOptions.model || 'claude-3-7-sonnet-20250219',
      temperature: 0.7,
      max_tokens: 8192,
      system: [{
        type: 'text',
        text: systemMessage,
        cache_control: { type: 'ephemeral' }
      }],
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    spinner.succeed(chalk.green('Anthropic API request completed'));

    if (isDebug()) {
      console.log(chalk.cyan('\n[DEBUG] LLM Information:'));
      console.log(chalk.yellow('[DEBUG] Prompt Input Tokens:'), chalk.white(message.usage?.input_tokens));
      console.log(chalk.yellow('[DEBUG] Cache Input Tokens:'), chalk.white(message.usage?.cache_creation_input_tokens));
      console.log(chalk.yellow('[DEBUG] Cache Read Input Tokens:'), chalk.white(message.usage?.cache_read_input_tokens));
      console.log(chalk.yellow('[DEBUG] Completion Output Tokens:'), chalk.white(message.usage?.output_tokens));
      console.log(chalk.yellow('[DEBUG] Total Tokens:'),
        chalk.white(message.usage?.input_tokens +
          (message.usage?.cache_creation_input_tokens || 0) +
          (message.usage?.cache_read_input_tokens || 0) +
          message.usage?.output_tokens)
      );
      console.log(chalk.yellow('[DEBUG] Model:'), chalk.white(message.model));
      console.log(chalk.yellow('[DEBUG] Finish Reason:'), chalk.white(message.stop_reason));
    }

    return message.content[0].type === 'text' ? message.content[0].text : 'Empty response from Anthropic';
  } catch (error) {
    spinner.fail(chalk.red('Anthropic API request failed'));
    if (error instanceof Error) {
      console.error(chalk.red('Error message:'), error);
    }
    throw error;
  }
}