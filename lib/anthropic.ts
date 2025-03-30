import chalk from 'chalk';
import ora from 'ora';
import Anthropic from '@anthropic-ai/sdk';
import { addVisualSpacing } from './console-utils.js';
import { LlmOptions } from './types.js';

export async function callAnthropic(prompt: string, content: string, apiKey: string, llmOptions: LlmOptions, debug: boolean = false): Promise<string> {
  const spinner = ora(chalk.cyan('Making Anthropic API request...')).start();

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    const message = await anthropic.messages.create({
      model: llmOptions.model || 'claude-3-7-sonnet-20250219',
      messages: [
        {
          role: 'assistant',
          content: prompt
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    spinner.succeed(chalk.green('Anthropic API request completed'));

    if (debug) {
      console.log(chalk.cyan('\n[DEBUG] LLM Information:'));
      console.log(chalk.yellow('[DEBUG] Prompt Tokens:'), chalk.white(message.usage?.input_tokens));
      console.log(chalk.yellow('[DEBUG] Completion Tokens:'), chalk.white(message.usage?.output_tokens));
      console.log(chalk.yellow('[DEBUG] Total Tokens:'), chalk.white(message.usage?.input_tokens + message.usage?.output_tokens));
      console.log(chalk.yellow('[DEBUG] Model:'), chalk.white(message.model));
      console.log(chalk.yellow('[DEBUG] Finish Reason:'), chalk.white(message.stop_reason));
      addVisualSpacing();
    }

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error) {
    spinner.fail(chalk.red('✕ Anthropic API request failed'));
    console.error(chalk.red('✕ Error in Anthropic API call:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('✕ Error message:'), error);
    }
    throw error;
  }
} 