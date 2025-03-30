import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./markdown";
import { writeFileSafely } from "./file-utils";
import chalk from 'chalk';

export async function generateAndWriteContributions(prs: any[], issues: any[]): Promise<string> {
  console.log(chalk.blue('Generating markdown content...'));
  const markdownContent = await generateMarkdownContent([...prs, ...issues]);
  await writeFileSafely("contributions.md", markdownContent);
  console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
  return markdownContent;
}

export async function generateAndWriteSummary(markdownContent: string, apiKey: string, debug: boolean): Promise<string> {
  console.log(); // Add spacing before summary generation
  console.log(chalk.blue('Generating summary document...'));
  const summary = await generateSummaryFromContributions(markdownContent, apiKey, debug);
  await writeFileSafely("summarized_contributions.md", summary);
  console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
  return summary;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, debug: boolean): Promise<void> {
  console.log(); // Add spacing before brag generation
  console.log(chalk.blue('Generating brag document...'));
  const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate, debug);
  await writeFileSafely("brag_document.md", brag);
  console.log(chalk.green('✓ Brag document generated: output/brag_document.md'));
}

export async function handleBragGeneration(markdownContent: string, apiKey: string, startDate: Date, endDate: Date, debug: boolean): Promise<void> {
  const summary = await generateAndWriteSummary(markdownContent, apiKey, debug);
  await generateAndWriteBrag(summary, apiKey, startDate, endDate, debug);
} 