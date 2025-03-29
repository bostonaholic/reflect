interface CliArgs {
  username: string;
  months: number;
}

interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
}

function validArgCount(args: string[]): boolean {
  return args.length === 2;
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

function validateArgs(args: string[]): ValidationResult<CliArgs> {
  if (!validArgCount(args)) {
    console.error("Usage: npx ts-node index.ts <github-username> <months-to-look-back>");
    console.error("Example: npx ts-node index.ts bostonaholic 6");
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

  return {
    isValid: true,
    value: {
      username: usernameResult.value!,
      months: monthsResult.value!
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