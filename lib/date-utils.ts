import chalk from "chalk";

export function calculateDateRange(lookbackMonths?: number, startDate?: string, endDate?: string): { startDate: Date; endDate: Date } {
  if (startDate && endDate) {
    if (lookbackMonths) {
      console.warn(chalk.yellow('! Lookback months will be ignored when startDate or endDate are provided'));
    }

    // Looking to avoid issue where it gets converted to local time, and changes date
    const parsedStartDate = new Date(`${startDate}T00:00:00`);
    const parsedEndDate = new Date(`${endDate}T23:59:59`);

    console.log(chalk.green('Pulling github data from'), chalk.cyan(parsedStartDate), chalk.green('to'), chalk.cyan(parsedEndDate));
    
    // At this point, cli logic has already validated dates
    return {startDate: parsedStartDate, endDate: new Date(parsedEndDate)};
  }

  if (lookbackMonths) {
    return calculateLookbackDateRange(lookbackMonths);
  }

  // Likely won't be hit as this should be validated by cli, but including for completeness
  console.error(chalk.red('✖ Error: Either --lookback, or --start-date and --end-date, must be provided'));
  process.exit(1);
}

function calculateLookbackDateRange(lookbackMonths: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - lookbackMonths);
  return { startDate, endDate };
}

export function formatDateRangeForGitHub(startDate: Date, endDate: Date): string {
  return `${startDate.toISOString().split('T')[0]}..${endDate.toISOString().split('T')[0]}`;
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
