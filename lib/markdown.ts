import { GitHubPr, GitHubIssue } from "./types.js";
import { generateContributionsSummary } from "./contributions-summarizer.js";
import { generateBragDocument } from "./brag-generator.js";

export async function generateMarkdownContent(items: (GitHubPr | GitHubIssue)[]): Promise<string> {
  let markdownContent = '# GitHub Activity Report\n\n';
  
  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `Type: ${item.type === 'pr' ? 'Pull Request' : 'Issue'}\n`;
      markdownContent += `Repository: ${item.repository}\n`;
      markdownContent += `Closed at: ${item.closedAt}\n\n`;
      markdownContent += `${item.body}\n\n`;
      markdownContent += "---\n\n";
    });

  return markdownContent;
}

export async function generateSummaryFromContributions(markdownContent: string, apiKey: string, model: string = 'gpt-4', debug: boolean = false): Promise<string> {
  return generateContributionsSummary(markdownContent, apiKey, model, debug);
}

export async function generateBragFromSummary(summary: string, apiKey: string, startDate: Date, endDate: Date, model: string = 'gpt-4', debug: boolean = false): Promise<string> {
  return generateBragDocument(summary, apiKey, startDate, endDate, model, debug);
}