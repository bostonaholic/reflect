import { fetchMergedPRs, fetchClosedIssues, fetchReviewedPRs } from "./github.js";
import { GitHubPr, GitHubIssue } from "../../core/types.js";

function buildFilter(
  prefix: string,
  includeItems?: string[],
  excludeItems?: string[]
): string {
  if (includeItems?.length) {
    const validItems = includeItems.map(item => item.trim()).filter(item => item.length > 0);
    if (validItems.length === 0) return '';
    if (validItems.length === 1) {
      return ` ${prefix}:${validItems[0]}`;
    }
    return ` (${validItems.map(item => `${prefix}:${item}`).join(' OR ')})`;
  }
  if (excludeItems?.length) {
    const validItems = excludeItems.map(item => item.trim()).filter(item => item.length > 0);
    if (validItems.length === 0) return '';
    return ` ${validItems.map(item => `-${prefix}:${item}`).join(' ')}`;
  }
  return '';
}

export function buildOrgFilter(includeOrgs?: string[], excludeOrgs?: string[]): string {
  return buildFilter('org', includeOrgs, excludeOrgs);
}

export function buildRepoFilter(includeRepos?: string[], excludeRepos?: string[]): string {
  return buildFilter('repo', includeRepos, excludeRepos);
}

export async function fetchGitHubData(
  username: string,
  dateRange: string,
  includeOrgs?: string[],
  excludeOrgs?: string[],
  includeRepos?: string[],
  excludeRepos?: string[]
): Promise<{ prs: GitHubPr[]; issues: GitHubIssue[]; reviews: GitHubPr[] }> {
  const prs = await fetchMergedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
  const issues = await fetchClosedIssues(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
  const reviews = await fetchReviewedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
  return { prs, issues, reviews };
}