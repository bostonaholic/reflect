import { config } from '@dotenvx/dotenvx';
import { Command } from 'commander';
import chalk from 'chalk';
import { LlmOptions, LlmProvider } from './types.js';
import ora from 'ora';
import { VALID_PROVIDERS } from '../integrations/llm/llm.js';
import {
  isValidDateFormat,
  parseDate,
  isStartBeforeEnd,
  isDateRangeWithinLimit
} from '../utils/date-utils.js';

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
  since?: string;
  startDate?: string;
  endDate?: string;
  generateBrag: boolean;
  debug?: boolean;
  includeOrgs?: string[];
  excludeOrgs?: string[];
  includeRepos?: string[];
  excludeRepos?: string[];
  llmOptions: LlmOptions;
}

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

function isValidGitHubUsername(username: string): boolean {
  return GITHUB_USERNAME_REGEX.test(username);
}

function isValidMonths(months: number): boolean {
  return months > 0 && months <= 36;
}

export { isValidGitHubUsername, isValidMonths };

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
const REPO_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export function isValidRepo(repo: string): boolean {
  const parts = repo.split('/');
  if (parts.length !== 2) {
    return false;
  }
  const [owner, name] = parts;
  return GITHUB_USERNAME_REGEX.test(owner) && REPO_NAME_REGEX.test(name);
}

function validateRepoFilters(includeRepos?: string[], excludeRepos?: string[]): void {
  if (includeRepos?.length && excludeRepos?.length) {
    console.error(chalk.red('✖ Error: Cannot use both --include-repos and --exclude-repos simultaneously'));
    process.exit(1);
  }

  const invalidRepos = new Set<string>();

  if (includeRepos?.length) {
    for (const repo of includeRepos) {
      if (!isValidRepo(repo)) {
        invalidRepos.add(repo);
      }
    }
  }

  if (excludeRepos?.length) {
    for (const repo of excludeRepos) {
      if (!isValidRepo(repo)) {
        invalidRepos.add(repo);
      }
    }
  }

  if (invalidRepos.size > 0) {
    console.error(chalk.red(`✖ Error: Invalid repository names: ${Array.from(invalidRepos).join(', ')}`));
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

export function validateDateMode(lookback?: number, since?: string, startDate?: string, endDate?: string): void {
  const hasLookback = lookback !== undefined;
  const hasSince = since !== undefined;
  const hasStartDate = startDate !== undefined;
  const hasEndDate = endDate !== undefined;

  const modeCount = [hasLookback, hasSince, hasStartDate || hasEndDate].filter(Boolean).length;

  if (modeCount > 1) {
    console.error(chalk.red('✖ Error: Cannot combine --lookback, --since, and --start-date/--end-date'));
    process.exit(1);
  }

  if ((hasStartDate && !hasEndDate) || (!hasStartDate && hasEndDate)) {
    console.error(chalk.red('✖ Error: Both --start-date and --end-date are required when using date range'));
    process.exit(1);
  }

  if (!hasLookback && !hasSince && !hasStartDate && !hasEndDate) {
    console.error(chalk.red('✖ Error: Must specify either --lookback, --since, or both --start-date and --end-date'));
    process.exit(1);
  }
}

const MAX_DATE_RANGE_MONTHS = 36;

export function validateSinceDate(since: string): void {
  if (!isValidDateFormat(since)) {
    console.error(chalk.red('✖ Error: Invalid since date format. Use YYYY-MM-DD'));
    process.exit(1);
  }

  const parsedSince = parseDate(since);
  const now = new Date();

  if (!isStartBeforeEnd(parsedSince, now)) {
    console.error(chalk.red('✖ Error: Since date must be in the past'));
    process.exit(1);
  }

  if (!isDateRangeWithinLimit(parsedSince, now, MAX_DATE_RANGE_MONTHS)) {
    console.error(chalk.red(`✖ Error: Since date cannot be more than ${MAX_DATE_RANGE_MONTHS} months ago`));
    process.exit(1);
  }
}

export function validateDateInputs(startDate: string, endDate: string): void {
  if (!isValidDateFormat(startDate)) {
    console.error(chalk.red('✖ Error: Invalid start date format. Use YYYY-MM-DD'));
    process.exit(1);
  }

  if (!isValidDateFormat(endDate)) {
    console.error(chalk.red('✖ Error: Invalid end date format. Use YYYY-MM-DD'));
    process.exit(1);
  }

  const parsedStart = parseDate(startDate);
  const parsedEnd = parseDate(endDate);

  if (!isStartBeforeEnd(parsedStart, parsedEnd)) {
    console.error(chalk.red('✖ Error: Start date must be before or equal to end date'));
    process.exit(1);
  }

  if (!isDateRangeWithinLimit(parsedStart, parsedEnd, MAX_DATE_RANGE_MONTHS)) {
    console.error(chalk.red(`✖ Error: Date range cannot exceed ${MAX_DATE_RANGE_MONTHS} months`));
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
    .requiredOption('--username <username>', 'GitHub username to analyze')
    .option('--lookback <number>', 'Number of months to look back', parseInt)
    .option('--since <date>', 'Start date (YYYY-MM-DD), fetches activity from this date to today')
    .option('--start-date <date>', 'Start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'End date (YYYY-MM-DD)')
    .option('--provider <provider>', 'LLM provider to use (e.g., openai, anthropic)', 'openai')
    .option('--model <model>', 'LLM model to use (defaults to gpt-4.1 for openai, claude-sonnet-4-6 for anthropic)')
    .option('--brag', 'Generate a brag document')
    .option('--debug', 'Enable debug mode for detailed LLM API information')
    .option('--include-orgs <orgs...>', 'Only include contributions to these organizations')
    .option('--exclude-orgs <orgs...>', 'Exclude contributions to these organizations')
    .option('--include-repos <repos...>', 'Only include contributions to these repositories')
    .option('--exclude-repos <repos...>', 'Exclude contributions to these repositories')
    .addHelpText('after', `
        Note: Set OPENAI_API_KEY in your .env file for brag document generation

        Date range options (mutually exclusive):
          --lookback <months>                  Look back N months from today
          --since <YYYY-MM-DD>                 From this date to today
          --start-date <YYYY-MM-DD> --end-date <YYYY-MM-DD>   Specify exact date range

        Examples:
          reflect --username bostonaholic --lookback 6 --brag
          reflect --username bostonaholic --since 2025-01-01
          reflect --username bostonaholic --start-date 2025-01-01 --end-date 2025-06-30
          reflect --username bostonaholic --lookback 6 --include-orgs "Shopify"
          reflect --username bostonaholic --lookback 6 --exclude-orgs "secret"
          reflect --username bostonaholic --lookback 6 --include-repos "owner1/repo1"
          reflect --username bostonaholic --lookback 6 --exclude-repos "owner1/repo1"
      `);

  try {
    program.parse();
    const options = program.opts();

    if (options.debug) {
      warnDebugDeprecation();
    }

    validateUsername(options.username);
    validateDateMode(options.lookback, options.since, options.startDate, options.endDate);
    if (options.lookback !== undefined) {
      validateMonths(options.lookback);
    }
    if (options.since) {
      validateSinceDate(options.since);
    }
    if (options.startDate && options.endDate) {
      validateDateInputs(options.startDate, options.endDate);
    }
    validateOrgFilters(options.includeOrgs, options.excludeOrgs);
    validateRepoFilters(options.includeRepos, options.excludeRepos);
    validateProvider(options.provider);

    return {
      username: options.username,
      lookback: options.lookback,
      since: options.since,
      startDate: options.startDate,
      endDate: options.endDate,
      generateBrag: options.brag || false,
      debug: options.debug,
      includeOrgs: options.includeOrgs,
      excludeOrgs: options.excludeOrgs,
      includeRepos: options.includeRepos,
      excludeRepos: options.excludeRepos,
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