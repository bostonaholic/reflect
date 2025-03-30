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
  includeOrgs?: string[];
  excludeOrgs?: string[];
  model?: string;
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
  return months > 0 && months <= 36;
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
    console.error(chalk.red('✕ Error: Months must be a positive number and not exceed 36'));
    process.exit(1);
  }
}

function validateBragOption(brag: boolean): void {
  if (brag) {
    getApiKeyFromEnv();
  }
}

function validateOrgFilters(includeOrgs?: string[], excludeOrgs?: string[]): void {
  if (includeOrgs?.length && excludeOrgs?.length) {
    console.error(chalk.red('✕ Error: Cannot use both --include-orgs and --exclude-orgs simultaneously'));
    process.exit(1);
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
    .option('--model <model>', 'OpenAI model to use (e.g., gpt-4, gpt-3.5-turbo)', 'gpt-4o-mini')
    .option('-b, --brag', 'Generate a brag document')
    .option('-d, --debug', 'Enable debug mode for detailed OpenAI API information')
    .option('-i, --include-orgs <orgs...>', 'Only include contributions to these organizations')
    .option('-e, --exclude-orgs <orgs...>', 'Exclude contributions to these organizations')
    .addHelpText('after', `
        Note: Set OPENAI_API_KEY in your .env file for brag document generation
        Example: reflect --username bostonaholic --months 6 --brag
        Example with org filters: reflect --username bostonaholic --months 6 --include-orgs "Shopify"
        Example with org filters: reflect --username bostonaholic --months 6 --exclude-orgs "secret"
      `);
    
    program.parse();

  const options = program.opts();

  validateUsername(options.username);
  validateMonths(options.months);
  validateBragOption(options.brag);
  validateOrgFilters(options.includeOrgs, options.excludeOrgs);

  return {
    username: options.username,
    months: options.months,
    generateBrag: options.brag || false,
    debug: options.debug || false,
    includeOrgs: options.includeOrgs,
    excludeOrgs: options.excludeOrgs,
    model: options.model
  };
} 