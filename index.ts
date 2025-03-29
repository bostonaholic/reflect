import * as fs from "fs/promises";
import * as path from "path";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./lib/markdown";
import { getCommandLineArgs } from "./lib/cli";
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from "./lib/date-utils";
import chalk from 'chalk';
import ora from 'ora';

const OUTPUT_DIR = "output";
const ALLOWED_FILES = ["contributions.md", "summarized_contributions.md", "brag_document.md"];

function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and ensure the filename is in the allowed list
  const basename = path.basename(filename);
  if (!ALLOWED_FILES.includes(basename)) {
    throw new Error(`Invalid output filename: ${filename}`);
  }
  return basename;
}

async function writeFileSafely(filename: string, content: string): Promise<void> {
  const safeFilename = sanitizeFilename(filename);
  const outputPath = path.join(OUTPUT_DIR, safeFilename);
  
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(outputPath, content);
}

async function main(): Promise<void> {
  try {
    const { username, months, generateBrag } = getCommandLineArgs();
    const baseCommand = `--author ${username} --limit 1000 --json title,body,closedAt `;
    
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(months);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);
    
    const [prs, issues] = await Promise.all([
      fetchMergedPRs(baseCommand, dateRange),
      fetchClosedIssues(baseCommand, dateRange)
    ]);

    const markdownSpinner = ora(chalk.blue('Generating markdown content...')).start();
    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await writeFileSafely("contributions.md", markdownContent);
    markdownSpinner.succeed(chalk.green('Markdown file generated: output/contributions.md'));
    
    console.log(chalk.blue(`Fetched ${chalk.bold(prs.length)} PRs and ${chalk.bold(issues.length)} issues for ${chalk.bold(username)}`));
    console.log(chalk.blue(`From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`));

    if (generateBrag) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for brag document generation');
      }

      const summarySpinner = ora(chalk.blue('Generating summary document...')).start();
      const summary = await generateSummaryFromContributions(markdownContent, apiKey);
      await writeFileSafely("summarized_contributions.md", summary);
      summarySpinner.succeed(chalk.green('Summary document generated: output/summarized_contributions.md'));
      
      const bragSpinner = ora(chalk.blue('Generating brag document...')).start();
      const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate);
      await writeFileSafely("brag_document.md", brag);
      bragSpinner.succeed(chalk.green('Brag document generated: output/brag_document.md'));
    }
  } catch (error) {
    console.error(chalk.red('Execution error:'), error);
    process.exit(1);
  }
}

main(); 