import * as repl from 'repl';
import chalk from 'chalk';
import { callAnthropic } from '../lib/integrations/llm/anthropic.js';
import { callOpenAI } from '../lib/integrations/llm/openai.js';
import { readPrompt } from '../lib/prompts/prompt-utils.js';
import { fetchGitHubData } from '../lib/integrations/github/github-utils.js';
import { generateContributionsDocument } from '../lib/generators/contributions-generator.js';
import { generateReviewCommentsDocument } from '../lib/generators/review-comments-generator.js';
import { generateContributionsSummary } from '../lib/generators/contributions-summarizer.js';
import { generateBragDocument } from '../lib/generators/brag-generator.js';
import { fetchReviewedPRs, fetchClosedIssues, fetchMergedPRs } from '../lib/integrations/github/github.js';

// Create a REPL server
const replServer = repl.start({
  prompt: 'reflect> ',
  useColors: true,
  useGlobal: true,
  ignoreUndefined: true,
});

// Load environment variables
import 'dotenv/config';

// Define the modules that will be available in the REPL context
const modulesToLoad = {
  callAnthropic,
  callOpenAI,
  readPrompt,
  fetchGitHubData,
  generateContributionsDocument,
  generateReviewCommentsDocument,
  generateContributionsSummary,
  generateBragDocument,
  fetchReviewedPRs,
  fetchClosedIssues,
  fetchMergedPRs,
};

// Make all the modules available in the REPL context
Object.assign(replServer.context, modulesToLoad);

// Add some helpful information
console.log(chalk.cyan('\nWelcome to the Reflect REPL!'));
console.log(chalk.gray('\nAvailable modules and functions:'));
Object.keys(modulesToLoad).forEach((key) => {
  console.log(chalk.gray(`- ${key}`));
});
console.log(chalk.gray('\nEnvironment variables are loaded from .env'));
console.log(chalk.gray('\nType .help to see available REPL commands\n'));