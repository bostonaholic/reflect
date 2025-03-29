import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execPromise = promisify(exec);

interface Item {
  title: string;
  body: string;
  closedAt: string;
}

async function fetchMergedPRs(baseCommand: string, dateRange: string): Promise<Item[]> {
  const prCommand = `gh search prs ${baseCommand} --merged true --merged-at ${dateRange}`;

  try {
    const result = await execPromise(prCommand);
    if (result.stderr) console.error("PR Error:", result.stderr);
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return [];
  }
}

async function fetchClosedIssues(baseCommand: string, dateRange: string): Promise<Item[]> {
  const issueCommand = `gh search issues ${baseCommand} --created ${dateRange}`;

  try {
    const result = await execPromise(issueCommand);
    if (result.stderr) console.error("Issue Error:", result.stderr);
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
}

async function generateMarkdownContent(items: Item[]): Promise<string> {
  let markdownContent = "# Merged Pull Requests and Closed Issues\n\n";
  
  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `Closed at: ${item.closedAt}\n\n`;
      markdownContent += `${item.body}\n\n`;
      markdownContent += "---\n\n";
    });

  return markdownContent;
}

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
