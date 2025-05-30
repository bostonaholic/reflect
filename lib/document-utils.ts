import { writeFileSafely } from "./file-utils.js";
import { LlmOptions } from "./types.js";
import chalk from 'chalk';
import { generateContributionsDocument } from "./contributions-generator.js";
import { generateReviewCommentsDocument } from "./review-comments-generator.js";
import { generateContributionsSummary } from "./contributions-summarizer.js";
import { generateBragDocument } from "./brag-generator.js";
import { GitHubPr, GitHubIssue } from "./types.js";

export async function generateAndWriteContributions(prs: GitHubPr[], issues: GitHubIssue[]): Promise<string> {
  console.log(chalk.cyan('ℹ Generating markdown content...'));
  let contributions = await generateContributionsDocument([...prs, ...issues]);
  const result = await writeFileSafely("contributions.md", contributions);
  if (result.didWrite) {
    console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteReviewContributions(reviews: GitHubPr[]): Promise<string> {
  console.log(chalk.cyan('ℹ Generating review contributions markdown content...'));
  let markdownContent = await generateReviewCommentsDocument([...reviews]);
  const result = await writeFileSafely("review_contributions.md", markdownContent);
  if (result.didWrite) {
    console.log(chalk.green('✓ Review contributions markdown file generated: output/review_contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteSummary(contributions: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  console.log(chalk.cyan('ℹ Generating summary document...'));
  let summary = await generateContributionsSummary(contributions, apiKey, llmOptions);
  const result = await writeFileSafely("summarized_contributions.md", summary);
  if (result.didWrite) {
    console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
  }
  return result.content;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  console.log(chalk.cyan('ℹ Generating brag document...'));
  let brag = await generateBragDocument(summary, apiKey, startDate, endDate, llmOptions);
  const result = await writeFileSafely("brag_document.md", brag);
  if (result.didWrite) {
    console.log(chalk.green('✓ Brag document generated: output/brag_document.md'));
  }
  return result.content;
}

export async function handleBragGeneration(contributions: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  const summary = await generateAndWriteSummary(contributions, apiKey, llmOptions);
  return generateAndWriteBrag(summary, apiKey, startDate, endDate, llmOptions);
}