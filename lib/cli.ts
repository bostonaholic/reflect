import { config } from 'dotenv';

function loadEnv() {
  const configResult = config();
  if (configResult.error) {
    console.log('No .env file found, will use command line arguments for API key');
  } else {
    console.log('Loaded environment variables from .env file');
  }
}

interface CliArgs {
  username: string;
  months: number;
  generateBrag?: boolean;
  apiKey?: string;
}

interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
}

function validArgCount(args: string[]): boolean {
  return args.length >= 2 && args.length <= 4;
}

function validateUsername(username: string): ValidationResult<string> {
  if (!username || username.trim().length === 0) {
    return { isValid: false };
  }
  return { isValid: true, value: username.trim() };
}

function validateMonths(monthsStr: string): ValidationResult<number> {
  const months = parseInt(monthsStr, 10);
  if (isNaN(months) || months <= 0) {
    return { isValid: false };
  }
  return { isValid: true, value: months };
}

function validateApiKey(apiKey: string): ValidationResult<string> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false };
  }
  return { isValid: true, value: apiKey.trim() };
}

function getApiKeyFromEnv(): string | undefined {
  loadEnv();
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    console.log('Using OpenAI API key from environment variable');
  }
  return apiKey;
}

function validateArgs(args: string[]): ValidationResult<CliArgs> {
  if (!validArgCount(args)) {
    console.error("Usage: npx ts-node index.ts <github-username> <months-to-look-back> [--brag] [--api-key <openai-api-key>]");
    console.error("Example: npx ts-node index.ts bostonaholic 6 --brag --api-key sk-...");
    console.error("Note: You can also set OPENAI_API_KEY in your .env file");
    return { isValid: false };
  }

  const usernameResult = validateUsername(args[0]);
  if (!usernameResult.isValid) {
    console.error("Error: username cannot be empty");
    return { isValid: false };
  }

  const monthsResult = validateMonths(args[1]);
  if (!monthsResult.isValid) {
    console.error("Error: months must be a positive number");
    return { isValid: false };
  }

  let generateBrag = false;
  let apiKey: string | undefined;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--brag') {
      generateBrag = true;
    } else if (args[i] === '--api-key' && i + 1 < args.length) {
      const apiKeyResult = validateApiKey(args[i + 1]);
      if (!apiKeyResult.isValid) {
        console.error("Error: API key cannot be empty");
        return { isValid: false };
      }
      apiKey = apiKeyResult.value;
      i++; // Skip the next argument since we've processed it
    }
  }

  // If --brag is specified but no API key provided in command line, try to get it from environment
  if (generateBrag && !apiKey) {
    apiKey = getApiKeyFromEnv();
    if (!apiKey) {
      console.error("Error: API key is required when generating a brag document. Set it with --api-key or in your .env file");
      return { isValid: false };
    }
  }

  return {
    isValid: true,
    value: {
      username: usernameResult.value!,
      months: monthsResult.value!,
      generateBrag,
      apiKey
    }
  };
}

export function getCommandLineArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result = validateArgs(args);
  if (!result.isValid) {
    process.exit(1);
  }
  return result.value!;
} 