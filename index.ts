import * as fs from "fs/promises";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent, generateSummaryFromContributions, generateBragFromSummary } from "./lib/markdown";
import { getCommandLineArgs } from "./lib/cli";
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from "./lib/date-utils";
import chalk from 'chalk';

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

    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await fs.writeFile("output/contributions.md", markdownContent);
    console.log(chalk('✓ Markdown file generated: output/contributions.md'));
    console.log(chalk(`📊 Fetched ${prs.length} PRs and ${issues.length} issues for ${username}`));
    console.log(chalk(`📅 From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}`));

    if (generateBrag && apiKey) {
      console.log(chalk('\n🔄 Generating summary and brag documents...'));
      const summary = await generateSummaryFromContributions(markdownContent, apiKey);
      await fs.writeFile("output/summarized.md", summary);
      console.log(chalk('✓ Summary document generated: output/summarized.md'));
      
      const brag = await generateBragFromSummary(summary, apiKey, startDate, endDate);
      await fs.writeFile("output/brag_document.md", brag);
      console.log(chalk('✓ Brag document generated: output/brag_document.md'));
    }
  } catch (error) {
    console.error(chalk('❌ Execution error:'), error);
    process.exit(1);
  }
}

main(); 