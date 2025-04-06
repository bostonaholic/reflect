import { config } from 'dotenv';
import { Command } from 'commander';
import chalk from 'chalk';
import { LlmOptions, LlmProvider } from './types.js';
import ora from 'ora';
import { VALID_PROVIDERS } from './llm.js';

let envLoaded = false;

function loadEnv() {
  if (envLoaded) return;

  const spinner = ora('Loading environment variables...').start();
  const configResult = config();
  if (configResult.error) {
    spinner.warn(chalk.yellow('No .env file found, proceeding without it'));
  } else {
    spinner.succeed(chalk.green('Loaded environment variables from .env file'));
  }
  envLoaded = true;
}

export interface CliArgs {
  username: string;
  lookback?: number;
  startDate?: string;
  endDate?: string;
  generateBrag: boolean;
  debug?: boolean;
  includeOrgs?: string[];
  excludeOrgs?: string[];
  llmOptions: LlmOptions;
}

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// YYYY-MM-DD format
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidGitHubUsername(username: string): boolean {
  return GITHUB_USERNAME_REGEX.test(username);
}

function isValidMonths(months: number): boolean {
  return months > 0 && months <= 36;
}

function isValidDateFormat(date: string): boolean {
  return DATE_REGEX.test(date);
}

function isValidDate(date: string): boolean {  
  if (!isValidDateFormat(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(part => parseInt(part, 10));
  
  // Month is 0-indexed
  const formattedDate = new Date(year, month - 1, day);

  // Verify each portion of the date is valid (to handle edge cases like 2025-02-31)
  const isValidDay = formattedDate.getDate() === day;
  const isValidMonth = formattedDate.getMonth() === month - 1;
  const isValidYear = formattedDate.getFullYear() === year;
  
  if (!isValidDay || !isValidMonth || !isValidYear) {
    return false;
  }

  return true;
}

// Stay consistent with lookback only supporting up to 3 years in the past
function isDateOverThreeYearsAgo(date: Date): boolean {
  // Make this smarter so that time is ignored, but cli will always pass in YYYY-MM-DD
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const threeYearsAgo = new Date(today);
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  return date < threeYearsAgo;
}

function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

export { isValidGitHubUsername, isValidMonths, isValidDateFormat, isValidDate, isDateOverThreeYearsAgo, isDateInFuture };

function validateUsername(username: string): void {
  if (!isValidGitHubUsername(username)) {
    console.error(chalk.red('✖ Error: Invalid GitHub username format'));
    process.exit(1);
  }
}

function validateMonths(months: number): void {
  if (!isValidMonths(months)) {
    console.error(chalk.red('✖ Error: Months must be a positive number and not exceed 36'));
    process.exit(1);
  }
}

function validateOrgFilters(includeOrgs?: string[], excludeOrgs?: string[]): void {
  if (includeOrgs?.length && excludeOrgs?.length) {
    console.error(chalk.red('✖ Error: Cannot use both --include-orgs and --exclude-orgs simultaneously'));
    process.exit(1);
  }

  const invalidOrgs = new Set<string>();

  if (includeOrgs?.length) {
    for (const org of includeOrgs) {
      if (!isValidGitHubUsername(org)) {
        invalidOrgs.add(org);
      }
    }
  }

  if (excludeOrgs?.length) {
    for (const org of excludeOrgs) {
      if (!isValidGitHubUsername(org)) {
        invalidOrgs.add(org);
      }
    }
  }

  if (invalidOrgs.size > 0) {
    console.error(chalk.red(`✖ Error: Invalid organization names: ${Array.from(invalidOrgs).join(', ')}`));
    process.exit(1);
  }
}

function validateProvider(provider: LlmProvider): void {
  if (!VALID_PROVIDERS.includes(provider)) {
    console.error(chalk.red(`✖ Error: Invalid provider ${provider}`))
    console.log(chalk.cyan(`! Valid providers are: ${VALID_PROVIDERS.join(', ')}`));
    process.exit(1);
  }
}

function validateStartAndEndDate(startDate: string, endDate: string): void {
  if (!isValidDate(startDate)) {
    console.error(chalk.red(`✖ Error: Invalid date entered. Please confirm that ${startDate} is a valid date using YYYY-MM-DD format.`));
    process.exit(1);
  }

  if (!isValidDate(endDate)) {
    console.error(chalk.red(`✖ Error: Invalid date entered. Please confirm that ${endDate} is a valid date using YYYY-MM-DD format.`));
    process.exit(1);
  }

  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);
  
  validateDateRange(formattedStartDate, formattedEndDate);
}


function validateDateRange(startDate: Date, endDate: Date): void {  
  // Reject if start date is too far in the past
  if (isDateOverThreeYearsAgo(startDate)) {
    console.error(chalk.red(`✖ Error: Start date must not be earlier than 3 years ago`));
    process.exit(1);
  };


  if (isDateInFuture(endDate)) {
    console.error(chalk.red(`✖ Error: End date must not be in the future`));
    process.exit(1);
  };
  
  // Confirm that start date is before end date
  if (startDate > endDate) {
    console.error(chalk.red(`✖ Error: Start date must be before or equal to end date`));
    process.exit(1);
  }
}

function warnDebugDeprecation(): void {
  console.warn(chalk.yellow('! Warning: --debug is deprecated. Use DEBUG=1 in your environment instead.'));
}

export function getCommandLineArgs(): CliArgs {
  loadEnv();

  const program = new Command();

  program
    .name('reflect')
    .description('Generate GitHub activity reports and brag documents')
    .version('0.1.0')
    .requiredOption('-u, --username <username>', 'GitHub username to analyze')
    .option('-l, --lookback <number>', 'Number of months to look back', parseInt)
    .option('-s, --start-date <date>', 'Inclusive start date in YYYY-MM-DD format, used with --end-date')
    .option('-e, --end-date <date>', 'Inclusive end date in YYYY-MM-DD format, used with --start-date')
    .option('-p, --provider <provider>', 'LLM provider to use (e.g., openai, anthropic)', 'openai')
    .option('-m, --model <model>', 'OpenAI model to use (e.g., gpt-4, gpt-3.5-turbo)')
    .option('-b, --brag', 'Generate a brag document')
    .option('-d, --debug', 'Enable debug mode for detailed OpenAI API information')
    .option('-i, --include-orgs <orgs...>', 'Only include contributions to these organizations')
    .option('-x, --exclude-orgs <orgs...>', 'Exclude contributions to these organizations')
    .addHelpText('after', `
        Note: Set OPENAI_API_KEY in your .env file for brag document generation
        Example: reflect --username bostonaholic --lookback 6 --brag
        Example with dates: reflect --username bostonaholic --start-date 01-01-2023 --end-date 30-06-2023 --brag
        Example with org filters: reflect --username bostonaholic --lookback 6 --include-orgs "Shopify"
        Example with org filters: reflect --username bostonaholic --lookback 6 --exclude-orgs "secret"
      `);

  try {
    program.parse();
    const options = program.opts();

    if (options.debug) {
      warnDebugDeprecation();
    }

    validateUsername(options.username);
    
    if (options.startDate && options.endDate) {
      validateStartAndEndDate(options.startDate, options.endDate);
    } else if (options.lookback) {
      validateMonths(options.lookback);
    } else {
      console.error(chalk.red('✖ Error: Either --lookback, or --start-date and --end-date together, must be provided'));
      process.exit(1);
    }
    
    validateOrgFilters(options.includeOrgs, options.excludeOrgs);
    validateProvider(options.provider);

    return {
      username: options.username,
      lookback: options.lookback || 0,
      generateBrag: options.brag || false,
      debug: options.debug,
      includeOrgs: options.includeOrgs,
      excludeOrgs: options.excludeOrgs,
      startDate: options.startDate,
      endDate: options.endDate,
      llmOptions: {
        provider: options.provider || 'openai',
        model: options.model
      } as LlmOptions
    };
  } catch (error) {
    console.error(chalk.red('✖ Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
    process.exit(1);
  }
}
