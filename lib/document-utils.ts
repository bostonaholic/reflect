import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./markdown.js";
import { writeFileSafely } from "./file-utils.js";
import { addVisualSpacing } from "./console-utils.js";
import { LlmOptions } from "./types.js";
import chalk from 'chalk';

export async function generateAndWriteContributions(prs: any[], issues: any[]): Promise<string> {
  console.log(chalk.cyan('Generating markdown content...'));
  let markdownContent = await generateMarkdownContent([...prs, ...issues]);
  const result = await writeFileSafely("contributions.md", markdownContent);
  if (result.didWrite) {
    console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteSummary(markdownContent: string, apiKey: string, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  console.log(chalk.cyan('Generating summary document...'));
  let summary = await generateSummaryFromContributions(markdownContent, apiKey, llmOptions, debug);
  const result = await writeFileSafely("summarized_contributions.md", summary);
  if (result.didWrite) {
    console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  addVisualSpacing();
  console.log(chalk.cyan('Generating brag document...'));
  let brag = await generateBragFromSummary(summary, apiKey, startDate, endDate, llmOptions, debug);
  const result = await writeFileSafely("brag_document.md", brag);
  if (result.didWrite) {
    console.log(chalk.green('✓ Brag document generated: output/brag_document.md'));
  }
  return result.content;
}

export async function handleBragGeneration(markdownContent: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  const summary = await generateAndWriteSummary(markdownContent, apiKey, llmOptions, debug);
  return generateAndWriteBrag(summary, apiKey, startDate, endDate, llmOptions, debug);
}