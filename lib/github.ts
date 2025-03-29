import { exec } from "child_process";
import { promisify } from "util";
import { Item } from "./types";
import chalk from 'chalk';

const execPromise = promisify(exec);

export async function fetchMergedPRs(baseCommand: string, dateRange: string): Promise<Item[]> {
  const prCommand = `gh search prs ${baseCommand} --merged true --merged-at ${dateRange}`;

  try {
    const result = await execPromise(prCommand);
    if (result.stderr) console.error(chalk.yellow('⚠️  PR Warning:'), result.stderr);
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error(chalk.red('❌ Error fetching PRs:'), error);
    return [];
  }
}

export async function fetchClosedIssues(baseCommand: string, dateRange: string): Promise<Item[]> {
  const issueCommand = `gh search issues ${baseCommand} --created ${dateRange}`;

  try {
    const result = await execPromise(issueCommand);
    if (result.stderr) console.error(chalk.yellow('⚠️  Issue Warning:'), result.stderr);
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error(chalk.red('❌ Error fetching issues:'), error);
    return [];
  }
} 