import { fetchMergedPRs, fetchClosedIssues } from "./github";
import chalk from 'chalk';
import { formatDateForDisplay } from "./date-utils";

export async function fetchGitHubData(username: string, dateRange: string): Promise<{ prs: any[], issues: any[] }> {
  const [prs, issues] = await Promise.all([
    fetchMergedPRs(username, dateRange),
    fetchClosedIssues(username, dateRange)
  ]);
  return { prs, issues };
}

export function logFetchStats(prs: any[], issues: any[], username: string, startDate: Date, endDate: Date): void {
  console.log(); // Add spacing before summary stats
  console.log(chalk.green(`Fetched ${chalk.bold(prs.length)} ${prs.length === 1 ? 'PR' : 'PRs'} and ${chalk.bold(issues.length)} ${issues.length === 1 ? 'issue' : 'issues'} for ${chalk.bold(username)}`));
  console.log(chalk.blue(`From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`));
} 