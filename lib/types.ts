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

export interface LlmOptions {
  provider: string;
  model?: string;
}