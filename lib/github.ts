import { exec } from "child_process";
import { promisify } from "util";
import { Item } from "./types";
import chalk from 'chalk';
import ora from 'ora';

const execPromise = promisify(exec);

interface GitHubError {
  message: string;
  status: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

function handleGitHubError(error: any): never {
  if (error.stderr) {
    try {
      const errorData = JSON.parse(error.stderr);
      if (errorData.message?.includes('rate limit exceeded')) {
        const resetTime = new Date(errorData.rateLimit?.reset * 1000).toLocaleTimeString();
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime}`);
      }
      throw new Error(errorData.message || 'GitHub API error');
    } catch (parseError) {
      throw new Error(`GitHub API error: ${error.stderr}`);
    }
  }
  throw error;
}

export async function fetchMergedPRs(baseCommand: string, dateRange: string): Promise<Item[]> {
  const prCommand = `gh search prs ${baseCommand} --merged true --merged-at ${dateRange}`;
  const spinner = ora(chalk.blue('Fetching merged pull requests...')).start();

  try {
    const result = await execPromise(prCommand);
    if (result.stderr) {
      spinner.warn(chalk.yellow('⚠️  PR Warning: ' + result.stderr));
    }
    const prs = JSON.parse(result.stdout);
    spinner.succeed(chalk.green(`Fetched ${prs.length} pull requests`));
    return prs;
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch PRs'));
    handleGitHubError(error);
  }
}

export async function fetchClosedIssues(baseCommand: string, dateRange: string): Promise<Item[]> {
  const issueCommand = `gh search issues ${baseCommand} --created ${dateRange}`;
  const spinner = ora(chalk.blue('Fetching closed issues...')).start();

  try {
    const result = await execPromise(issueCommand);
    if (result.stderr) {
      spinner.warn(chalk.yellow('⚠️  Issue Warning: ' + result.stderr));
    }
    const issues = JSON.parse(result.stdout);
    spinner.succeed(chalk.green(`Fetched ${issues.length} issues`));
    return issues;
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch issues'));
    handleGitHubError(error);
  }
} 