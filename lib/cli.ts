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
  debug: boolean;
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

function isValidGitHubUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

function isValidMonths(months: number): boolean {
  return months > 0;
}

export { isValidGitHubUsername, isValidMonths };

function validateUsername(username: string): void {
  if (!isValidGitHubUsername(username)) {
    console.error(chalk.red('✕ Error: Invalid GitHub username format'));
    process.exit(1);
  }
}

function validateMonths(months: number): void {
  if (!isValidMonths(months)) {
    console.error(chalk.red('✕ Error: Months must be a positive number'));
    process.exit(1);
  }
}

function validateBragOption(brag: boolean): void {
  if (brag) {
    getApiKeyFromEnv();
  }
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
    .option('-d, --debug', 'Enable debug mode for detailed OpenAI API information')
    .addHelpText('after', `
      Note: Set OPENAI_API_KEY in your .env file for brag document generation
      Example: reflect -u bostonaholic -m 6 -b
    `);

  program.parse();

  const options = program.opts();

  validateUsername(options.username);
  validateMonths(options.months);
  validateBragOption(options.brag);

  return {
    username: options.username,
    months: options.months,
    generateBrag: options.brag || false,
    debug: options.debug || false
  };
} 