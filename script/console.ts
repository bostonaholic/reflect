import * as repl from 'repl';
import { getCommandLineArgs } from '../lib/cli.js';
import { calculateDateRange, formatDateRangeForGitHub } from '../lib/date-utils.js';
import { fetchGitHubData } from '../lib/github-utils.js';
import { fetchClosedIssues, fetchMergedPRs } from '../lib/github.js';
import { callOpenAI } from '../lib/openai.js';
import { callAnthropic } from '../lib/anthropic.js';
import { callLlm } from '../lib/llm.js';
import { checkFileExists } from '../lib/file-utils.js';
import { readPrompt } from '../lib/prompt-utils.js';
import chalk from 'chalk';

// Create a REPL server
const replServer = repl.start({
  prompt: 'reflect> ',
  useColors: true,
  useGlobal: true,
  ignoreUndefined: true,
});

// Load environment variables
import 'dotenv/config';

// Make all the modules available in the REPL context
Object.assign(replServer.context, {
  getCommandLineArgs,
  calculateDateRange,
  formatDateRangeForGitHub,
  fetchGitHubData,
  fetchClosedIssues,
  fetchMergedPRs,
  callOpenAI,
  callAnthropic,
  callLlm,
  checkFileExists,
  readPrompt,
});

// Add some helpful information
console.log(chalk.cyan('\nWelcome to the Reflect REPL!'));
console.log(chalk.gray('\nAvailable modules and functions:'));
console.log(chalk.gray('- getCommandLineArgs()'));
console.log(chalk.gray('- calculateDateRange(months)'));
console.log(chalk.gray('- formatDateRangeForGitHub(startDate, endDate)'));
console.log(chalk.gray('- fetchGitHubData(username, dateRange, includeOrgs?, excludeOrgs?)'));
console.log(chalk.gray('- fetchClosedIssues(username, dateRange, includeOrgs?, excludeOrgs?)'));
console.log(chalk.gray('- fetchMergedPRs(username, dateRange, includeOrgs?, excludeOrgs?)'));
console.log(chalk.gray('- callLlm(prompt, content, apiKey, provider, model, debug)'));
console.log(chalk.gray('- callOpenAI(prompt, content, apiKey, model, debug)'));
console.log(chalk.gray('- callAnthropic(prompt, content, apiKey, model, debug)'));
console.log(chalk.gray('- checkFileExists(filePath)'));
console.log(chalk.gray('- readPrompt(promptName)'));
console.log(chalk.gray('\nEnvironment variables are loaded from .env'));
console.log(chalk.gray('\nType .help to see available REPL commands\n')); 