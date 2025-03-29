import * as fs from "fs/promises";
import * as path from "path";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./lib/markdown";
import { getCommandLineArgs } from "./lib/cli";
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from "./lib/date-utils";
import chalk from 'chalk';

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
  
  try {
    await fs.access(outputPath);
    // File exists, ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      readline.question(chalk.yellow(`! File ${safeFilename} already exists. Overwrite? (y/N) `), resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log(chalk.yellow(`! Skipping ${safeFilename}`));
      return;
    }
  } catch (error) {
    // File doesn't exist, proceed with writing
  }
  
  await fs.writeFile(outputPath, content);
}

async function main(): Promise<void> {
  try {
    const { username, months, generateBrag } = getCommandLineArgs();
    const baseCommand = `--author ${username} --limit 1000 --json title,body,closedAt,repository `;
    
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(months);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);
    
    const [prs, issues] = await Promise.all([
      fetchMergedPRs(baseCommand, dateRange),
      fetchClosedIssues(baseCommand, dateRange)
    ]);

    console.log(); // Add spacing after GitHub fetch results
    console.log(chalk.blue('Generating markdown content...'));
    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await writeFileSafely("contributions.md", markdownContent);
    console.log(chalk.green('✓ Markdown file generated: output/contributions.md'));
    
    console.log(); // Add spacing before summary stats
    console.log(chalk.blue(`Fetched ${chalk.bold(prs.length)} PRs and ${chalk.bold(issues.length)} issues for ${chalk.bold(username)}`));
    console.log(chalk.blue(`From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`));

    if (generateBrag) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for brag document generation');
      }

      console.log(); // Add spacing before summary generation
      console.log(chalk.blue('Generating summary document...'));
      const summary = await generateSummaryFromContributions(markdownContent, apiKey);
      await writeFileSafely("summarized_contributions.md", summary);
      console.log(chalk.green('✓ Summary document generated: output/summarized_contributions.md'));
      
      console.log(); // Add spacing before brag generation
      console.log(chalk.blue('Generating brag document...'));
      const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate);
      await writeFileSafely("brag_document.md", brag);
      console.log(chalk.green('✓ Brag document generated: output/brag_document.md'));
    }
  } catch (error) {
    console.error(chalk.red('✕ Execution error:'), error);
    process.exit(1);
  }
}

main(); 