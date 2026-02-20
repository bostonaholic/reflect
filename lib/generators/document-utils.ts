import { writeFileSafely } from "../utils/file-utils.js";
import { LlmOptions } from "../core/types.js";
import chalk from 'chalk';
import ora from 'ora';
import { generateContributionsDocument } from "./contributions-generator.js";
import { generateReviewCommentsDocument } from "./review-comments-generator.js";
import { generateContributionsSummary } from "./contributions-summarizer.js";
import { generateBragDocument } from "./brag-generator.js";
import { GitHubPr, GitHubIssue } from "../core/types.js";

export async function generateAndWriteContributions(prs: GitHubPr[], issues: GitHubIssue[]): Promise<string> {
  const spinner = ora(chalk.cyan('Generating contributions markdown...')).start();
  let contributions = await generateContributionsDocument([...prs, ...issues]);
  const result = await writeFileSafely("contributions.md", contributions);
  if (result.didWrite) {
    spinner.succeed(chalk.green('Contributions markdown file generated: output/contributions.md'));
  } else {
    spinner.stop();
  }
  return result.content;
}

export async function generateAndWriteReviewContributions(reviews: GitHubPr[]): Promise<string> {
  const spinner = ora(chalk.cyan('Generating review contributions markdown...')).start();
  let markdownContent = await generateReviewCommentsDocument([...reviews]);
  const result = await writeFileSafely("review_contributions.md", markdownContent);
  if (result.didWrite) {
    spinner.succeed(chalk.green('Review contributions markdown file generated: output/review_contributions.md'));
  } else {
    spinner.stop();
  }
  return result.content;
}

export async function generateAndWriteSummary(contributions: string, apiKey: string, llmOptions: LlmOptions): Promise<string> {
  const spinner = ora(chalk.cyan('Generating summary document...')).start();
  let summary = await generateContributionsSummary(contributions, apiKey, llmOptions);
  const result = await writeFileSafely("summarized_contributions.md", summary);
  if (result.didWrite) {
    spinner.succeed(chalk.green('Summary document generated: output/summarized_contributions.md'));
  } else {
    spinner.stop();
  }
  return result.content;
}

export async function generateAndWriteBrag(summary: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  const spinner = ora(chalk.cyan('Generating brag document...')).start();
  let brag = await generateBragDocument(summary, apiKey, startDate, endDate, llmOptions);
  const result = await writeFileSafely("brag_document.md", brag);
  if (result.didWrite) {
    spinner.succeed(chalk.green('Brag document generated: output/brag_document.md'));
  } else {
    spinner.stop();
  }
  return result.content;
}

export async function handleBragGeneration(contributions: string, apiKey: string, startDate: Date, endDate: Date, llmOptions: LlmOptions): Promise<string> {
  const summary = await generateAndWriteSummary(contributions, apiKey, llmOptions);
  return generateAndWriteBrag(summary, apiKey, startDate, endDate, llmOptions);
}
