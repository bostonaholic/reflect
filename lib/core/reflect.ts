import { calculateDateRange, formatDateRangeForGitHub, parseDate } from "../utils/date-utils.js";
import { fetchGitHubData } from "../integrations/github/github-utils.js";
import { generateAndWriteContributions, generateAndWriteReviewContributions, handleBragGeneration } from "../generators/document-utils.js";
import { promptForLocalFile } from "../utils/file-utils.js";
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
    const {
        username,
        lookback,
        startDate: startDateArg,
        endDate: endDateArg,
        generateBrag,
        debug,
        includeOrgs,
        excludeOrgs,
        includeRepos,
        excludeRepos,
        llmOptions
    } = args;

    // TODO: Remove after `--debug` deprecation period
    setDebug(debug);

    let startDate: Date;
    let endDate: Date;

    if (lookback !== undefined) {
        const dateRange = calculateDateRange(lookback);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
    } else {
        if (!startDateArg || !endDateArg) {
            throw new Error('Start date and end date are required when lookback is not specified');
        }
        startDate = parseDate(startDateArg);
        endDate = parseDate(endDateArg);
    }

    const localContributions = await promptForLocalFile('contributions.md');
    const localReviewContributions = await promptForLocalFile('review_contributions.md');

    const needsGitHubFetch = localContributions === null || localReviewContributions === null;

    let prs: Awaited<ReturnType<typeof fetchGitHubData>>['prs'] = [];
    let issues: Awaited<ReturnType<typeof fetchGitHubData>>['issues'] = [];
    let reviews: Awaited<ReturnType<typeof fetchGitHubData>>['reviews'] = [];

    if (needsGitHubFetch) {
        const dateRange = formatDateRangeForGitHub(startDate, endDate);
        ({ prs, issues, reviews } = await fetchGitHubData(
            username,
            dateRange,
            includeOrgs,
            excludeOrgs,
            includeRepos,
            excludeRepos
        ));
    }

    if (localReviewContributions === null) {
        await generateAndWriteReviewContributions(reviews, true);
    }

    let contributions: string;
    if (localContributions !== null) {
        contributions = localContributions;
    } else {
        contributions = await generateAndWriteContributions(prs, issues, true);
    }

    if (generateBrag) {
        const apiKey = getApiKeyFromEnv(llmOptions.provider);
        if (!apiKey) {
            throw new Error('LLM API key environment variable is required for brag document generation');
        }
        await handleBragGeneration(contributions, apiKey, startDate, endDate, llmOptions, true);
    }
} 