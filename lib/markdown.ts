import { Item } from "./types";
import { generateContributionsSummary } from "./contributions-summarizer";
import { generateBragDocument } from "./brag-generator";

export async function generateMarkdownContent(items: Item[]): Promise<string> {
  let markdownContent = "# Merged Pull Requests and Closed Issues\n\n";
  
  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `Closed at: ${item.closedAt}\n\n`;
      markdownContent += `${item.body}\n\n`;
      markdownContent += "---\n\n";
    });

  return markdownContent;
}

export async function generateSummaryFromContributions(contributionsContent: string, apiKey: string): Promise<string> {
  return generateContributionsSummary(contributionsContent, apiKey);
}

export async function generateBragFromSummary(contributionsSummary: string, apiKey: string): Promise<string> {
  return generateBragDocument(contributionsSummary, apiKey);
}