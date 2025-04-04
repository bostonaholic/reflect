import { GitHubPr, GitHubIssue } from "./types.js";

export async function generateContributionsDocument(items: (GitHubPr | GitHubIssue)[]): Promise<string> {
  const repos = new Set(items.map(item => item.repository));
  const prs = items.filter(item => item.type === 'pr').length;
  const issues = items.filter(item => item.type === 'issue').length;

  let markdownContent = '# GitHub Activity Report\n\n';
  markdownContent += `## Statistics\n`;
  markdownContent += `- Total Repositories: ${repos.size}\n`;
  markdownContent += `- Total Pull Requests: ${prs}\n`;
  markdownContent += `- Total Issues: ${issues}\n\n`;
  markdownContent += `## Repositories\n`;
  markdownContent += Array.from(repos).map(repo => `- ${repo}`).join('\n');
  markdownContent += '\n\n';

  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `URL: ${item.url}\n`;
      markdownContent += `Type: ${item.type === 'pr' ? 'Pull Request' : 'Issue'}\n`;
      markdownContent += `Repository: ${item.repository}\n`;
      markdownContent += `Closed at: ${item.closedAt}\n\n`;
      markdownContent += `${item.body}\n\n`;
      markdownContent += "---\n\n";
    });

  return markdownContent;
}
