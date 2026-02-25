import { fetchMergedPRs, fetchClosedIssues, fetchReviewedPRs } from "./github.js";
import { GitHubPr, GitHubIssue } from "../../core/types.js";
import chalk from 'chalk';
import ora from 'ora';

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

export function deduplicateByUrl<T extends { url: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export async function fetchGitHubData(
  username: string,
  dateRange: string,
  includeOrgs?: string[],
  excludeOrgs?: string[],
  includeRepos?: string[],
  excludeRepos?: string[]
): Promise<{ prs: GitHubPr[]; issues: GitHubIssue[]; reviews: GitHubPr[] }> {
  const multipleOrgs = includeOrgs && includeOrgs.length > 1;
  const multipleRepos = includeRepos && includeRepos.length > 1;

  if (!multipleOrgs && !multipleRepos) {
    const prs = await fetchMergedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
    const issues = await fetchClosedIssues(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
    const reviews = await fetchReviewedPRs(username, dateRange, includeOrgs, excludeOrgs, includeRepos, excludeRepos);
    return { prs, issues, reviews };
  }

  // GitHub GraphQL doesn't support (org:X OR org:Y) syntax — it silently returns 0 results.
  // Query each include org/repo individually and deduplicate.
  const orgSets = multipleOrgs ? includeOrgs.map(org => [org]) : [includeOrgs];
  const repoSets = multipleRepos ? includeRepos.map(repo => [repo]) : [includeRepos];

  const prSpinner = ora(chalk.cyan('Fetching merged pull requests...')).start();
  const allPrs: GitHubPr[] = [];
  for (const orgSet of orgSets) {
    for (const repoSet of repoSets) {
      const prs = await fetchMergedPRs(username, dateRange, orgSet, excludeOrgs, repoSet, excludeRepos, true);
      allPrs.push(...prs);
    }
  }
  const dedupedPrs = deduplicateByUrl(allPrs);
  const prCount = dedupedPrs.length;
  prSpinner.succeed(chalk.green(`Fetched ${prCount} pull request${prCount === 1 ? '' : 's'}`));

  const issueSpinner = ora(chalk.cyan('Fetching closed issues...')).start();
  const allIssues: GitHubIssue[] = [];
  for (const orgSet of orgSets) {
    for (const repoSet of repoSets) {
      const issues = await fetchClosedIssues(username, dateRange, orgSet, excludeOrgs, repoSet, excludeRepos, true);
      allIssues.push(...issues);
    }
  }
  const dedupedIssues = deduplicateByUrl(allIssues);
  const issueCount = dedupedIssues.length;
  issueSpinner.succeed(chalk.green(`Fetched ${issueCount} closed issue${issueCount === 1 ? '' : 's'}`));

  const reviewSpinner = ora(chalk.cyan('Fetching reviewed pull requests...')).start();
  const allReviews: GitHubPr[] = [];
  for (const orgSet of orgSets) {
    for (const repoSet of repoSets) {
      const reviews = await fetchReviewedPRs(username, dateRange, orgSet, excludeOrgs, repoSet, excludeRepos, true);
      allReviews.push(...reviews);
    }
  }
  const dedupedReviews = deduplicateByUrl(allReviews);
  const reviewCount = dedupedReviews.length;
  reviewSpinner.succeed(chalk.green(`Fetched ${reviewCount} reviewed pull request${reviewCount === 1 ? '' : 's'}`));

  return {
    prs: dedupedPrs,
    issues: dedupedIssues,
    reviews: dedupedReviews,
  };
}