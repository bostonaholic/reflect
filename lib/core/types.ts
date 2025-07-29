import { VALID_PROVIDERS } from '../integrations/llm/llm.js';


export interface GitHubComment {
  author: string;
  body: string;
}

export interface GitHubReview { 
  author: string;
  state: string;
  body: string;
  comments: GitHubComment[];
}
export interface GitHubContribution {
  url: string;
  title: string;
  permalink: string | null;
  body: string;
  closedAt: string;
  repository: string;
  comments: GitHubComment[];
}

export interface GitHubPr extends GitHubContribution {
  type: 'pr';
  reviews: GitHubReview[];
}

export interface GitHubIssue extends GitHubContribution {
  type: 'issue';
}

export type LlmProvider = typeof VALID_PROVIDERS[number];

export interface LlmOptions {
  provider: LlmProvider;
  model?: string;
}
