import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Reads a prompt from a markdown file
 * @param promptName Name of the prompt file (without .md extension)
 * @returns The prompt content as a string
 */
export async function readPrompt(promptName: string): Promise<string> {
  const promptPath = path.join(__dirname, 'prompts', `${promptName}.md`);
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading prompt file ${promptName}:`, error);
    throw error;
  }
} 