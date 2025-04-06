import { calculateDateRange, formatDateRangeForGitHub } from "./date-utils.js";
import { fetchGitHubData } from "./github-utils.js";
import { generateAndWriteContributions, handleBragGeneration } from "./document-utils.js";
import { CliArgs } from "./cli.js";
import { setDebug } from "./debug-utils.js";

function getApiKeyFromEnv(provider: string): string | undefined {
    if (provider === 'openai') {
        return process.env.OPENAI_API_KEY;
    } else if (provider === 'anthropic') {
        return process.env.ANTHROPIC_API_KEY;
    }
}

export async function reflect(args: CliArgs): Promise<void> {
    const { username, lookback, generateBrag, debug, includeOrgs, excludeOrgs, llmOptions } = args;

    // TODO: Remove after `--debug` deprecation period
    setDebug(debug);

    const { startDate, endDate } = calculateDateRange(lookback);
    const dateRange = formatDateRangeForGitHub(startDate, endDate);

    const { prs, issues } = await fetchGitHubData(username, dateRange, includeOrgs, excludeOrgs);

    const contributions = await generateAndWriteContributions(prs, issues);

    if (generateBrag) {
        const apiKey = getApiKeyFromEnv(llmOptions.provider);
        if (!apiKey) {
            throw new Error('LLM API key environment variable is required for brag document generation');
        }
        await handleBragGeneration(contributions, apiKey, startDate, endDate, llmOptions);
    }
} 