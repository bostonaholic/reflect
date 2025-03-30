import chalk from 'chalk';
import ora from 'ora';
import OpenAI from 'openai';

export async function callOpenAI(prompt: string, content: string, apiKey: string, debug: boolean = false): Promise<string> {
  const spinner = ora(chalk.blue('Making OpenAI API request...')).start();

  try {
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      console.log(chalk.blue('\nDebug Information:'));
      console.log(chalk.yellow('Prompt Tokens:'), chalk.white(completion.usage?.prompt_tokens));
      console.log(chalk.yellow('Completion Tokens:'), chalk.white(completion.usage?.completion_tokens));
      console.log(chalk.yellow('Total Tokens:'), chalk.white(completion.usage?.total_tokens));
      console.log(chalk.yellow('Model:'), chalk.white(completion.model));
      console.log(chalk.yellow('Finish Reason:'), chalk.white(completion.choices[0].finish_reason));
    }

    return completion.choices[0].message.content || '';
  } catch (error) {
    spinner.fail(chalk.red('✕ OpenAI API request failed'));
    console.error(chalk.red('✕ Error in OpenAI API call:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('✕ Error message:'), chalk.yellow(error.message));
    }
    throw error;
  }
} 