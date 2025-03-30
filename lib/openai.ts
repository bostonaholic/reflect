import chalk from 'chalk';
import ora from 'ora';
import OpenAI from 'openai';
import { addVisualSpacing } from './console-utils.js';

export async function callOpenAI(prompt: string, content: string, apiKey: string, model: string = 'gpt-4o-mini', debug: boolean = false): Promise<string> {
  const spinner = ora(chalk.cyan('Making OpenAI API request...')).start();

  try {
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
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

    spinner.succeed(chalk.green('OpenAI API request completed'));

    if (debug) {
      console.log(chalk.cyan('\n[DEBUG] LLM Information:'));
      console.log(chalk.yellow('[DEBUG] Prompt Tokens:'), chalk.white(completion.usage?.prompt_tokens));
      console.log(chalk.yellow('[DEBUG] Completion Tokens:'), chalk.white(completion.usage?.completion_tokens));
      console.log(chalk.yellow('[DEBUG] Total Tokens:'), chalk.white(completion.usage?.total_tokens));
      console.log(chalk.yellow('[DEBUG] Model:'), chalk.white(completion.model));
      console.log(chalk.yellow('[DEBUG] Finish Reason:'), chalk.white(completion.choices[0].finish_reason));
      addVisualSpacing();
    }

    return completion.choices[0].message.content || '';
  } catch (error) {
    spinner.fail(chalk.red('✕ OpenAI API request failed'));
    console.error(chalk.red('✕ Error in OpenAI API call:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('✕ Error message:'), error);
    }
    throw error;
  }
} 