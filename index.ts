import * as fs from "fs/promises";
import { fetchMergedPRs, fetchClosedIssues } from "./lib/github";
import { generateMarkdownContent } from "./lib/markdown";

async function main(): Promise<void> {
  try {
    const baseCommand = `--author bostonaholic --limit 1000 --json title,body,closedAt `;
    const dateRange = `$(date -v-6m +%Y-%m-%d)..$(date +%Y-%m-%d)`;
    const [prs, issues] = await Promise.all([
      fetchMergedPRs(baseCommand, dateRange),
      fetchClosedIssues(baseCommand, dateRange)
    ]);

    const markdownContent = await generateMarkdownContent([...prs, ...issues]);
    await fs.writeFile("merged_prs_and_issues.md", markdownContent);
    console.log("Markdown file generated: merged_prs_and_issues.md");
  } catch (error) {
    console.error("Execution error:", error);
  }
}

main(); 