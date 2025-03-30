import { graphql } from "@octokit/graphql";
import { GitHubPr, GitHubIssue } from "./types.js";
import chalk from 'chalk';
import ora from 'ora';

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

function getGraphQLClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }
  return graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  });
}

interface SearchResult {
  search: {
    nodes: Array<{
      title: string;
      body: string;
      closedAt: string;
      repository: {
        nameWithOwner: string;
      };
    }>;
  };
}

export async function fetchMergedPRs(username: string, dateRange: string): Promise<GitHubPr[]> {
  const spinner = ora(chalk.blue('Fetching merged pull requests...')).start();
  const graphqlClient = getGraphQLClient();

  try {
    const [startDate, endDate] = dateRange.split('..');
    const query = `
      query {
        search(
          query: "author:${username} is:pr is:merged merged:${startDate}..${endDate} -org:Shopify"
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
        }
      }
    `;

    if (process.env.DEBUG) {
      console.log(chalk.yellow('Debug: GraphQL Query:'), query);
    }

    const result = await graphqlClient<SearchResult>(query);
    
    if (process.env.DEBUG) {
      console.log(chalk.yellow('Debug: GraphQL Response:'), JSON.stringify(result, null, 2));
    }

    const prs = result.search.nodes;
    const count = prs.length;
    spinner.succeed(chalk.green(`Fetched ${count} pull request${count === 1 ? '' : 's'}`));
    
    return prs.map(pr => ({
      title: pr.title,
      body: pr.body || '',
      closedAt: pr.closedAt,
      repository: pr.repository.nameWithOwner,
      type: 'pr' as const
    }));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch PRs'));
    if (process.env.DEBUG) {
      console.error(chalk.yellow('Debug: Error details:'), error);
    }
    handleGitHubError(error);
  }
}

export async function fetchClosedIssues(username: string, dateRange: string): Promise<GitHubIssue[]> {
  const spinner = ora(chalk.blue('Fetching closed issues...')).start();
  const graphqlClient = getGraphQLClient();

  try {
    const [startDate, endDate] = dateRange.split('..');
    const query = `
      query {
        search(
          query: "author:${username} is:issue is:closed created:${startDate}..${endDate} -org:Shopify"
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
        }
      }
    `;

    if (process.env.DEBUG) {
      console.log(chalk.yellow('Debug: GraphQL Query:'), query);
    }

    const result = await graphqlClient<SearchResult>(query);
    
    if (process.env.DEBUG) {
      console.log(chalk.yellow('Debug: GraphQL Response:'), JSON.stringify(result, null, 2));
    }

    const issues = result.search.nodes;
    const count = issues.length;
    spinner.succeed(chalk.green(`Fetched ${count} closed issue${count === 1 ? '' : 's'}`));
    
    return issues.map(issue => ({
      title: issue.title,
      body: issue.body || '',
      closedAt: issue.closedAt,
      repository: issue.repository.nameWithOwner,
      type: 'issue' as const
    }));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch issues'));
    if (process.env.DEBUG) {
      console.error(chalk.yellow('Debug: Error details:'), error);
    }
    handleGitHubError(error);
  }
} 