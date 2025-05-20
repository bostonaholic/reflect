import { fetchMergedPRs, fetchClosedIssues, fetchReviewedPRs } from "./github.js";
import { GitHubPr, GitHubIssue } from "./types.js";

export function buildOrgFilter(includeOrgs?: string[], excludeOrgs?: string[]): string {
  if (includeOrgs?.length) {
    return ` org:${includeOrgs.join(' org:')}`;
  }
  if (excludeOrgs?.length) {
    return ` -org:${excludeOrgs.join(' -org:')}`;
  }
  return '';
}

export function buildRepoFilter(includeRepos?: string[], excludeRepos?: string[]): string {
  if (includeRepos?.length) {
    return ` repo:${includeRepos.join(' repo:')}`;
  }
  if (excludeRepos?.length) {
    return ` -repo:${excludeRepos.join(' -repo:')}`;
  }
  return '';
}

export async function fetchGitHubData(
  username: string,
  dateRange: string,
  includeOrgs?: string[],
  excludeOrgs?: string[],
  includeRepos?: string[],
  excludeRepos?: string[]
): Promise<{ prs: GitHubPr[]; issues: GitHubIssue[]; reviews: GitHubPr[] }> {
  const [prs, issues, reviews] = await Promise.all([
    fetchMergedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos),
    fetchClosedIssues(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos),
    fetchReviewedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos)
  ]);
  return { prs, issues, reviews };
}