import chalk from 'chalk';
import ora from 'ora';

export async function callOpenAI(prompt: string, content: string, apiKey: string): Promise<string> {
  const spinner = ora(chalk.blue('Making OpenAI API request...')).start();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      spinner.fail(chalk.red('OpenAI API request failed'));
      console.error(chalk.red('OpenAI API Error Details:'), {
        status: chalk.yellow(response.status),
        statusText: chalk.yellow(response.statusText),
        error: errorData
      });
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    spinner.succeed(chalk.green('OpenAI API request completed'));
    return data.choices[0].message.content;
  } catch (error) {
    spinner.fail(chalk.red('OpenAI API request failed'));
    console.error(chalk.red('Error in OpenAI API call:'), error);
    if (error instanceof Error) {
      console.error(chalk.red('Error message:'), chalk.yellow(error.message));
    }
    throw error;
  }
} 