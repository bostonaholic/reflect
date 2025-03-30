import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./markdown.js";
import { writeFileSafely } from "./file-utils.js";
import { addVisualSpacing } from "./console-utils.js";
import chalk from 'chalk';

export async function generateAndWriteContributions(prs: any[], issues: any[]): Promise<string> {
  console.log(chalk.cyan('Generating markdown content...'));
  let markdownContent = await generateMarkdownContent([...prs, ...issues]);
  markdownContent = await writeFileSafely("contributions.md", markdownContent);
  console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
  return markdownContent;
}

export async function generateAndWriteSummary(markdownContent: string, apiKey: string, debug: boolean): Promise<string> {
  console.log(chalk.cyan('Generating summary document...'));
  let summary = await generateSummaryFromContributions(markdownContent, apiKey, debug);
  summary = await writeFileSafely("summarized_contributions.md", summary);
  console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
  return summary;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, debug: boolean): Promise<string> {
  addVisualSpacing();
  console.log(chalk.cyan('Generating brag document...'));
  let brag = await generateBragFromSummary(summary, apiKey, startDate, endDate, debug);
  brag = await writeFileSafely("brag_document.md", brag);
  console.log(chalk.green('✓ Brag document generated: output/brag_document.md'));
  return brag;
}

export async function handleBragGeneration(markdownContent: string, apiKey: string, startDate: Date, endDate: Date, debug: boolean): Promise<string> {
  const summary = await generateAndWriteSummary(markdownContent, apiKey, debug);
  return generateAndWriteBrag(summary, apiKey, startDate, endDate, debug);
} 