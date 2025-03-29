import { Item } from "./types";
import { generateContributionsSummary } from "./contributions-summarizer";
import { generateBragDocument } from "./brag-generator";

export async function generateMarkdownContent(items: Item[]): Promise<string> {
  let markdownContent = "# Merged Pull Requests and Closed Issues\n\n";
  
  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `Repository: ${item.repository}\n`;
      markdownContent += `Closed at: ${item.closedAt}\n\n`;
      markdownContent += `${item.body}\n\n`;
      markdownContent += "---\n\n";
    });

  return markdownContent;
}

export async function generateSummaryFromContributions(markdownContent: string, apiKey: string): Promise<string> {
  return generateContributionsSummary(markdownContent, apiKey);
}

export async function generateBragFromSummary(summary: string, apiKey: string, startDate: Date, endDate: Date): Promise<string> {
  return generateBragDocument(summary, apiKey, startDate, endDate);
}

export async function generateSummaryAndBrag(markdownContent: string, apiKey: string, startDate: Date, endDate: Date): Promise<{ summary: string; brag: string }> {
  const summary = await generateSummaryFromContributions(markdownContent, apiKey);
  const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate);
  return { summary, brag };
}