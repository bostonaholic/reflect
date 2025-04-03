import { writeFileSafely } from "./file-utils.js";
import { LlmOptions } from "./types.js";
import chalk from 'chalk';
import ora from "ora";
import { generateContributionsDocument } from "./contributions-generator.js";
import { generateContributionsSummary } from "./contributions-summarizer.js";
import { generateBragDocument } from "./brag-generator.js";

export async function generateAndWriteContributions(prs: any[], issues: any[]): Promise<string> {
  console.log(chalk.cyan('Generating markdown content...'));
  let markdownContent = await generateContributionsDocument([...prs, ...issues]);
  const result = await writeFileSafely("contributions.md", markdownContent);
  if (result.didWrite) {
    console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteSummary(markdownContent: string, apiKey: string, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  console.log(chalk.cyan('Generating summary document...'));
  let summary = await generateContributionsSummary(markdownContent, apiKey, llmOptions, debug);
  const result = await writeFileSafely("summarized_contributions.md", summary);
  if (result.didWrite) {
    console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions, debug: boolean): Promise<string> {
  console.log(chalk.cyan('Generating brag document...'));
  let brag = await generateBragDocument(summary, apiKey, startDate, endDate, llmOptions, debug);
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