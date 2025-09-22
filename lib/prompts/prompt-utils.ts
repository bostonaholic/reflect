import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function readPrompt(promptName: string): Promise<string> {
  const promptPath = path.join(__dirname, 'system', `${promptName}.md`);
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error(chalk.red('✖ Error reading prompt file'), chalk.yellow(promptName), ':', error);
    throw error;
  }
}