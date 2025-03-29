import * as fs from "fs/promises";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./lib/markdown";
import { getCommandLineArgs } from "./lib/cli";
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from "./lib/date-utils";
import chalk from 'chalk';
import ora from 'ora';

async function main(): Promise<void> {
  try {
    const { username, months, generateBrag, apiKey } = getCommandLineArgs();
    const baseCommand = `--author ${username} --limit 1000 --json title,body,closedAt `;
    
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(months);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);
    
    const [prs, issues] = await Promise.all([
      fetchMergedPRs(baseCommand, dateRange),
      fetchClosedIssues(baseCommand, dateRange)
    ]);

    // Create output directory if it doesn't exist
    await fs.mkdir("output", { recursive: true });

    const markdownSpinner = ora(chalk.blue('Generating markdown content...')).start();
    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await fs.writeFile("output/contributions.md", markdownContent);
    markdownSpinner.succeed(chalk.green('Markdown file generated: output/contributions.md'));
    
    console.log(chalk.blue(`Fetched ${chalk.bold(prs.length)} PRs and ${chalk.bold(issues.length)} issues for ${chalk.bold(username)}`));
    console.log(chalk.blue(`From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`));

    if (generateBrag && apiKey) {
      const summarySpinner = ora(chalk.blue('Generating summary document...')).start();
      const summary = await generateSummaryFromContributions(markdownContent, apiKey);
      await fs.writeFile("output/summarized.md", summary);
      summarySpinner.succeed(chalk.green('Summary document generated: output/summarized.md'));
      
      const bragSpinner = ora(chalk.blue('Generating brag document...')).start();
      const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate);
      await fs.writeFile("output/brag_document.md", brag);
      bragSpinner.succeed(chalk.green('Brag document generated: output/brag_document.md'));
    }
  } catch (error) {
    console.error(chalk.red('Execution error:'), error);
    process.exit(1);
  }
}

main(); 