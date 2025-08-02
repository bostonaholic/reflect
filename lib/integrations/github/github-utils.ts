import { fetchMergedPRs, fetchClosedIssues, fetchReviewedPRs } from "./github.js";
import { GitHubPr, GitHubIssue } from "../../core/types.js";

export function buildOrgFilter(includeOrgs?: string[], excludeOrgs?: string[]): string {
  if (includeOrgs?.length) {
    const nonEmptyOrgs = includeOrgs.map(org => org.trim()).filter(org => org.length > 0);
    if (nonEmptyOrgs.length === 0) return '';
    if (nonEmptyOrgs.length === 1) {
      return ` org:${nonEmptyOrgs[0]}`;
    }
    return ` (${nonEmptyOrgs.map(org => `org:${org}`).join(' OR ')})`;
  }
  if (excludeOrgs?.length) {
    const nonEmptyOrgs = excludeOrgs.map(org => org.trim()).filter(org => org.length > 0);
    if (nonEmptyOrgs.length === 0) return '';
    return ` ${nonEmptyOrgs.map(org => `-org:${org}`).join(' ')}`;
  }
  return '';
}

export function buildRepoFilter(includeRepos?: string[], excludeRepos?: string[]): string {
  if (includeRepos?.length) {
    const nonEmptyRepos = includeRepos.map(repo => repo.trim()).filter(repo => repo.length > 0);
    if (nonEmptyRepos.length === 0) return '';
    if (nonEmptyRepos.length === 1) {
      return ` repo:${nonEmptyRepos[0]}`;
    }
    return ` (${nonEmptyRepos.map(repo => `repo:${repo}`).join(' OR ')})`;
  }
  if (excludeRepos?.length) {
    const nonEmptyRepos = excludeRepos.map(repo => repo.trim()).filter(repo => repo.length > 0);
    if (nonEmptyRepos.length === 0) return '';
    return ` ${nonEmptyRepos.map(repo => `-repo:${repo}`).join(' ')}`;
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