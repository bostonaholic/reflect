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
  lookback: number;
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
    .requiredOption('-l, --lookback <number>', 'Number of months to look back', parseInt)
    .option('-p, --provider <provider>', 'LLM provider to use (e.g., openai, anthropic)', 'openai')
    .option('-m, --model <model>', 'OpenAI model to use (e.g., gpt-4, gpt-3.5-turbo)')
    .option('-b, --brag', 'Generate a brag document')
    .option('-d, --debug', 'Enable debug mode for detailed OpenAI API information')
    .option('-i, --include-orgs <orgs...>', 'Only include contributions to these organizations')
    .option('-e, --exclude-orgs <orgs...>', 'Exclude contributions to these organizations')
    .option('-r, --include-repos <repos...>', 'Only include contributions to these repositories')
    .option('-x, --exclude-repos <repos...>', 'Exclude contributions to these repositories')
    .addHelpText('after', `
        Note: Set OPENAI_API_KEY in your .env file for brag document generation
        Example: reflect --username bostonaholic --lookback 6 --brag
        Example with org filters: reflect --username bostonaholic --lookback 6 --include-orgs "Shopify"
        Example with org filters: reflect --username bostonaholic --lookback 6 --exclude-orgs "secret"
        Example with repo filters: reflect --username bostonaholic --lookback 6 --include-repos "owner1/repo1"
        Example with repo filters: reflect --username bostonaholic --lookback 6 --exclude-repos "owner1/repo1"
      `);

  try {
    program.parse();
    const options = program.opts();

    if (options.debug) {
      warnDebugDeprecation();
    }

    validateUsername(options.username);
    validateMonths(options.lookback);
    validateOrgFilters(options.includeOrgs, options.excludeOrgs);
    validateRepoFilters(options.includeRepos, options.excludeRepos);
    validateProvider(options.provider);

    return {
      username: options.username,
      lookback: options.lookback,
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