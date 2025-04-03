import { VALID_PROVIDERS } from './llm.js';

export interface GitHubContribution {
  title: string;
  body: string;
  closedAt: string;
  repository: string;
}

export interface GitHubPr extends GitHubContribution {
  type: 'pr';
}

export interface GitHubIssue extends GitHubContribution {
  type: 'issue';
}

export type LlmProvider = typeof VALID_PROVIDERS[number];

export interface LlmOptions {
  provider: LlmProvider;
  model?: string;
}