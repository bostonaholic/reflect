import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';

function loadEnv() {
  const configResult = config();
  if (configResult.error) {
    console.log(chalk.yellow('! No .env file found, will use command line arguments for API key'));
  } else {
    console.log(chalk.green('Loaded environment variables from .env file'));
  }
}

interface CliArgs {
  username: string;
  months: number;
  generateBrag: boolean;
}

function getApiKeyFromEnv(): string {
  loadEnv();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(chalk.red('✕ Error: OPENAI_API_KEY environment variable is required for brag document generation'));
    process.exit(1);
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
    .addHelpText('after', `
      Note: Set OPENAI_API_KEY in your .env file for brag document generation
      Example: reflect -u bostonaholic -m 6 -b
    `);

  program.parse();

  const options = program.opts();

  // Validate username format
  if (!/^[a-zA-Z0-9-]+$/.test(options.username)) {
    console.error(chalk.red('✕ Error: Invalid GitHub username format'));
    process.exit(1);
  }

  // Validate months is positive
  if (options.months <= 0) {
    console.error(chalk.red('✕ Error: Months must be a positive number'));
    process.exit(1);
  }

  // If --brag is specified, ensure API key is available
  if (options.brag) {
    getApiKeyFromEnv();
  }

  return {
    username: options.username,
    months: options.months,
    generateBrag: options.brag || false
  };
} 