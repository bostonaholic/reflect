import { fetchMergedPRs, fetchClosedIssues } from "./github.js";
import chalk from 'chalk';
import { formatDateForDisplay } from "./date-utils.js";
import { addVisualSpacing } from "./console-utils.js";

export function buildOrgFilter(includeOrgs?: string[], excludeOrgs?: string[]): string {
  if (includeOrgs?.length) {
    return ` org:${includeOrgs.join(' org:')}`;
  }
  if (excludeOrgs?.length) {
    return ` -org:${excludeOrgs.join(' -org:')}`;
  }
  return '';
}

export async function fetchGitHubData(
  username: string, 
  dateRange: string,
  includeOrgs?: string[],
  excludeOrgs?: string[]
): Promise<{ prs: any[], issues: any[] }> {
  const [prs, issues] = await Promise.all([
    fetchMergedPRs(username, dateRange, includeOrgs, excludeOrgs),
    fetchClosedIssues(username, dateRange, includeOrgs, excludeOrgs)
  ]);
  return { prs, issues };
}