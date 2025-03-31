import { getCommandLineArgs } from "./lib/cli.js";
import { calculateDateRange, formatDateRangeForGitHub } from "./lib/date-utils.js";
import { fetchGitHubData } from "./lib/github-utils.js";
import { generateAndWriteContributions, handleBragGeneration } from "./lib/document-utils.js";
import { addVisualSpacing } from "./lib/console-utils.js";
import chalk from 'chalk';
import { CliArgs } from "./lib/cli.js";

function getApiKeyFromEnv(provider: string): string | undefined {
  if (provider === 'openai') {
    return process.env.OPENAI_API_KEY;
  } else if (provider === 'anthropic') {
    return process.env.ANTHROPIC_API_KEY;
  }
}

export async function reflect(args: CliArgs): Promise<void> {
  const { username, lookback, generateBrag, debug, includeOrgs, excludeOrgs, llmOptions } = args;
  
  const { startDate, endDate } = calculateDateRange(lookback);
  const dateRange = formatDateRangeForGitHub(startDate, endDate);
  
  const { prs, issues } = await fetchGitHubData(username, dateRange, includeOrgs, excludeOrgs);
  addVisualSpacing();
  
  const markdownContent = await generateAndWriteContributions(prs, issues);
  addVisualSpacing();

  if (generateBrag) {
    const apiKey = getApiKeyFromEnv(llmOptions.provider);
    if (!apiKey) {
      throw new Error('LLM API key environment variable is required for brag document generation');
    }
    await handleBragGeneration(markdownContent, apiKey, startDate, endDate, llmOptions, debug);
  }
}

async function main(): Promise<void> {
  try {
    const args = getCommandLineArgs();
    await reflect(args);
  } catch (error) {
    console.error(chalk.red('✕ Execution error:'), error);
    process.exit(1);
  }
}

main(); 