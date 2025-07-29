import { calculateDateRange, formatDateRangeForGitHub } from "../utils/date-utils.js";
import { fetchGitHubData } from "../integrations/github/github-utils.js";
import { generateAndWriteContributions, generateAndWriteReviewContributions, handleBragGeneration } from "../generators/document-utils.js";
import { CliArgs } from "./cli.js";
import { setDebug } from "../utils/debug-utils.js";

function getApiKeyFromEnv(provider: string): string | undefined {
    if (provider === 'openai') {
        return process.env.OPENAI_API_KEY;
    } else if (provider === 'anthropic') {
        return process.env.ANTHROPIC_API_KEY;
    }
}

export async function reflect(args: CliArgs): Promise<void> {
    const { username, lookback, generateBrag, debug, includeOrgs, excludeOrgs, includeRepos, excludeRepos, llmOptions } = args;

    // TODO: Remove after `--debug` deprecation period
    setDebug(debug);

    const { startDate, endDate } = calculateDateRange(lookback);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);

    const { prs, issues, reviews } = await fetchGitHubData(
        username,
        dateRange,
        includeOrgs,
        excludeOrgs,
        includeRepos,
        excludeRepos
    );

    const reviewContent = await generateAndWriteReviewContributions(reviews);

    const contributions = await generateAndWriteContributions(prs, issues);

    if (generateBrag) {
        const apiKey = getApiKeyFromEnv(llmOptions.provider);
        if (!apiKey) {
            throw new Error('LLM API key environment variable is required for brag document generation');
        }
        await handleBragGeneration(contributions, apiKey, startDate, endDate, llmOptions);
    }
} 