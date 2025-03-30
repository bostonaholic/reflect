import * as fs from "fs/promises";
import * as path from "path";
import chalk from 'chalk';

const OUTPUT_DIR = "output";
const ALLOWED_FILES = ["contributions.md", "summarized_contributions.md", "brag_document.md"];

export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and ensure the filename is in the allowed list
  const basename = path.basename(filename);
  if (!ALLOWED_FILES.includes(basename)) {
    throw new Error(`Invalid output filename: ${filename}`);
  }
  return basename;
}

export async function createOutputDirectory(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

export async function promptForOverwrite(filename: string): Promise<boolean> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise<string>((resolve) => {
    readline.question(chalk.yellow(`! File ${filename} already exists. Overwrite? (y/N) `), resolve);
  });
  readline.close();
  
  return answer.toLowerCase() === 'y';
}

export async function writeFileSafely(filename: string, content: string): Promise<void> {
  const safeFilename = sanitizeFilename(filename);
  const outputPath = path.join(OUTPUT_DIR, safeFilename);
  
  await createOutputDirectory();
  
  const fileExists = await checkFileExists(outputPath);
  if (fileExists) {
    const shouldOverwrite = await promptForOverwrite(safeFilename);
    if (!shouldOverwrite) {
      console.log(chalk.yellow(`! Skipping ${safeFilename}`));
      return;
    }
  }
  
  await fs.writeFile(outputPath, content);
} 