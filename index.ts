import { getCommandLineArgs } from "./lib/cli.js";
import { calculateDateRange, formatDateRangeForGitHub } from "./lib/date-utils.js";
import { fetchGitHubData } from "./lib/github-utils.js";
import { generateAndWriteContributions, handleBragGeneration } from "./lib/document-utils.js";
import { addVisualSpacing } from "./lib/console-utils.js";
import chalk from 'chalk';

async function main(): Promise<void> {
  try {
    const { username, lookback, generateBrag, debug, includeOrgs, excludeOrgs, model } = getCommandLineArgs();
    
    const { startDate, endDate } = calculateDateRange(lookback);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);
    
    const { prs, issues } = await fetchGitHubData(username, dateRange, includeOrgs, excludeOrgs);
    addVisualSpacing();
    
    const markdownContent = await generateAndWriteContributions(prs, issues);
    addVisualSpacing();

    if (generateBrag) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for brag document generation');
      }
      await handleBragGeneration(markdownContent, apiKey, startDate, endDate, model, debug);
    }
  } catch (error) {
    console.error(chalk.red('✕ Execution error:'), error);
    process.exit(1);
  }
}

main(); 