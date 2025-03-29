import * as fs from "fs/promises";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent } from "./lib/markdown";
import { getCommandLineArgs } from "./lib/cli";

async function main(): Promise<void> {
  try {
    const { username, months } = getCommandLineArgs();
    const baseCommand = `--author ${username} --limit 1000 --json title,body,closedAt `;
    const dateRange = `$(date -v-${months}m +%Y-%m-%d)..$(date +%Y-%m-%d)`;
    
    const [prs, issues] = await Promise.all([
      fetchMergedPRs(baseCommand, dateRange),
      fetchClosedIssues(baseCommand, dateRange)
    ]);

    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await fs.writeFile("merged_prs_and_issues.md", markdownContent);
    console.log(`Markdown file generated: merged_prs_and_issues.md`);
    console.log(`Fetched ${prs.length} PRs and ${issues.length} issues for ${username} over the last ${months} months`);
  } catch (error) {
    console.error("Execution error:", error);
    process.exit(1);
  }
}

main(); 