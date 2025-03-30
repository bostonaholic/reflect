import { fetchMergedPRs, fetchClosedIssues } from "./github.js";
import chalk from 'chalk';
import { formatDateForDisplay } from "./date-utils.js";
import { addVisualSpacing } from "./console-utils.js";

export async function fetchGitHubData(username: string, dateRange: string): Promise<{ prs: any[], issues: any[] }> {
  const [prs, issues] = await Promise.all([
    fetchMergedPRs(username, dateRange),
    fetchClosedIssues(username, dateRange)
  ]);
  return { prs, issues };
}