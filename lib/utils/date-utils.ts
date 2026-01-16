export function calculateDateRange(months: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
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

export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Parses a date string in YYYY-MM-DD format to a UTC Date object.
 * @param dateString A date string in YYYY-MM-DD format
 * @throws Error if dateString is not valid
 */
export function parseDate(dateString: string): Date {
  if (!isValidDateFormat(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isDateRangeWithinLimit(startDate: Date, endDate: Date, maxMonths: number): boolean {
  const limitDate = new Date(startDate);
  limitDate.setMonth(limitDate.getMonth() + maxMonths);
  return endDate.getTime() <= limitDate.getTime();
}

export function isStartBeforeEnd(startDate: Date, endDate: Date): boolean {
  return startDate.getTime() <= endDate.getTime();
}
