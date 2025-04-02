import { getCommandLineArgs } from "./lib/cli.js";
import { reflect } from "./lib/reflect.js";
import chalk from 'chalk';

async function main(): Promise<void> {
  try {
    const args = getCommandLineArgs();
    await reflect(args);
  } catch (error) {
    console.error(chalk.red('✕ Execution error:'), error);
    process.exit(1);
  }
}

main();