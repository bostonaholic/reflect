import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';

function loadEnv() {
  const configResult = config();
  if (configResult.error) {
    console.log(chalk.yellow('No .env file found, will use command line arguments for API key'));
  } else {
    console.log(chalk.green('Loaded environment variables from .env file'));
  }
}

interface CliArgs {
  username: string;
  months: number;
  generateBrag: boolean;
  apiKey?: string;
}

function getApiKeyFromEnv(): string | undefined {
  loadEnv();
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    console.log(chalk.blue('Using OpenAI API key from environment variable'));
  }
  return apiKey;
}

export function getCommandLineArgs(): CliArgs {
  const program = new Command();

  program
    .name('reflect')
    .description('Generate GitHub activity reports and brag documents')
    .version('0.1.0')
    .requiredOption('-u, --username <username>', 'GitHub username to analyze')
    .requiredOption('-m, --months <number>', 'Number of months to look back', parseInt)
    .option('-b, --brag', 'Generate a brag document')
    .option('-k, --api-key <key>', 'OpenAI API key for brag document generation')
    .addHelpText('after', `
      Note: You can also set OPENAI_API_KEY in your .env file
      Example: reflect -u bostonaholic -m 6 -b
    `);

  program.parse();

  const options = program.opts();

  // If --brag is specified but no API key provided in command line, try to get it from environment
  if (options.brag && !options.apiKey) {
    options.apiKey = getApiKeyFromEnv();
    if (!options.apiKey) {
      console.error(chalk.red('Error: API key is required when generating a brag document. Set it with -k/--api-key or in your .env file'));
      process.exit(1);
    }
  }

  return {
    username: options.username,
    months: options.months,
    generateBrag: options.brag || false,
    apiKey: options.apiKey
  };
} 