/**
 * Calculates a date range based on the number of months to look back
 * @param months Number of months to look back
 * @returns Object containing start and end dates
 */
export function calculateDateRange(months: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  return { startDate, endDate };
}

/**
 * Formats a date range for GitHub CLI
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string for GitHub CLI
 */
export function formatDateRangeForGitHub(startDate: Date, endDate: Date): string {
  return `${startDate.toISOString().split('T')[0]}..${endDate.toISOString().split('T')[0]}`;
}

/**
 * Formats a date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 