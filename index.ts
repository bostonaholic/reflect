import { getCommandLineArgs } from "./lib/cli.js";
import { calculateDateRange, formatDateRangeForGitHub } from "./lib/date-utils.js";
import { fetchGitHubData, logFetchStats } from "./lib/github-utils.js";
import { generateAndWriteContributions, handleBragGeneration } from "./lib/document-utils.js";
import chalk from 'chalk';

async function main(): Promise<void> {
  try {
    const { username, months, generateBrag, debug } = getCommandLineArgs();
    
    // Calculate date range
    const { startDate, endDate } = calculateDateRange(months);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);
    
    const { prs, issues } = await fetchGitHubData(username, dateRange);
    console.log(); // Add spacing after GitHub fetch results
    
    const markdownContent = await generateAndWriteContributions(prs, issues);
    logFetchStats(prs, issues, username, startDate, endDate);

    if (generateBrag) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for brag document generation');
      }
      await handleBragGeneration(markdownContent, apiKey, startDate, endDate, debug);
    }
  } catch (error) {
    console.error(chalk.red('✕ Execution error:'), error);
    process.exit(1);
  }
}

main(); 