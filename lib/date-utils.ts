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