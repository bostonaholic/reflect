import { graphql } from "@octokit/graphql";
import { GitHubPr, GitHubIssue } from "./types.js";
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { buildOrgFilter } from './github-utils.js';

function handleGitHubError(error: any): never {
  // Handle GraphQL errors
  if (error.errors) {
    const errorMessage = error.errors[0]?.message || 'GraphQL error';
    if (errorMessage.includes('rate limit exceeded')) {
      const resetTime = new Date(error.errors[0]?.extensions?.rateLimit?.reset * 1000).toLocaleTimeString();
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetTime}`);
    }
    throw new Error(errorMessage);
  }

  // Handle network or other errors
  if (error.message) {
    throw new Error(`GitHub API error: ${error.message}`);
  }
  throw error;
}

function getGraphQLClient(spinner: Ora) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    spinner.fail(chalk.red('Error: GITHUB_TOKEN environment variable is required'));
    process.exit(1);
  }
  return graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  });
}

type SearchResultItem = {
  title: string;
  body: string;
  closedAt: string;
  repository: {
    nameWithOwner: string;
  };
};

interface SearchResult {
  search: {
    nodes: SearchResultItem[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

async function fetchAllSearchResults(
  graphqlClient: ReturnType<typeof graphql.defaults>,
  query: string,
  spinner: Ora
): Promise<SearchResultItem[]> {
  let allResults: SearchResultItem[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;

  while (hasNextPage) {
    const paginatedQuery: string = query.replace('first: 100', `first: 100${endCursor ? `, after: "${endCursor}"` : ''}`);
    const result: SearchResult = await graphqlClient(paginatedQuery);

    allResults = allResults.concat(result.search.nodes);
    hasNextPage = result.search.pageInfo.hasNextPage;
    endCursor = result.search.pageInfo.endCursor;

    if (hasNextPage) {
      spinner.text = chalk.cyan(`Fetched ${allResults.length} items so far...`);
    }
  }

  return allResults;
}

export async function fetchMergedPRs(username: string, dateRange: string, includeOrgs?: string[], excludeOrgs?: string[]): Promise<GitHubPr[]> {
  const spinner = ora(chalk.cyan('Fetching merged pull requests...')).start();
  const graphqlClient = getGraphQLClient(spinner);

  try {
    const [startDate, endDate] = dateRange.split('..');
    const orgFilter = buildOrgFilter(includeOrgs, excludeOrgs);

    const query = `
      query {
        search(
          query: "author:${username} is:pr is:merged merged:${startDate}..${endDate}${orgFilter}"
          type: ISSUE
          first: 100
        ) {
          nodes {
            ... on PullRequest {
              title
              body
              closedAt
              repository {
                nameWithOwner
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const prs = await fetchAllSearchResults(graphqlClient, query, spinner);
    const count = prs.length;
    spinner.succeed(chalk.green(`Fetched ${count} pull request${count === 1 ? '' : 's'}`));

    return prs.map((pr: SearchResultItem) => ({
      title: pr.title,
      body: pr.body || '',
      closedAt: pr.closedAt,
      repository: pr.repository.nameWithOwner,
      type: 'pr' as const
    }));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch PRs'));
    handleGitHubError(error);
  }
}

export async function fetchClosedIssues(username: string, dateRange: string, includeOrgs?: string[], excludeOrgs?: string[]): Promise<GitHubIssue[]> {
  const spinner = ora(chalk.cyan('Fetching closed issues...')).start();
  const graphqlClient = getGraphQLClient(spinner);

  try {
    const [startDate, endDate] = dateRange.split('..');
    const orgFilter = buildOrgFilter(includeOrgs, excludeOrgs);

    const query = `
      query {
        search(
          query: "author:${username} is:issue is:closed created:${startDate}..${endDate}${orgFilter}"
          type: ISSUE
          first: 100
        ) {
          nodes {
            ... on Issue {
              title
              body
              closedAt
              repository {
                nameWithOwner
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const issues = await fetchAllSearchResults(graphqlClient, query, spinner);
    const count = issues.length;
    spinner.succeed(chalk.green(`Fetched ${count} closed issue${count === 1 ? '' : 's'}`));

    return issues.map((issue: SearchResultItem) => ({
      title: issue.title,
      body: issue.body || '',
      closedAt: issue.closedAt,
      repository: issue.repository.nameWithOwner,
      type: 'issue' as const
    }));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch issues'));
    handleGitHubError(error);
  }
}