import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateDateRange,
  formatDateRangeForGitHub,
  formatDateForDisplay,
  isValidDateFormat,
  parseDate,
  isDateRangeWithinLimit,
  isStartBeforeEnd
} from '../../lib/utils/date-utils.js';
import * as fc from 'fast-check';

describe('calculateDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate correct date range for any valid number of months', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 36 }),
        (months: number) => {
          const { startDate, endDate } = calculateDateRange(months);
          const expectedEndDate = new Date('2024-03-30T12:00:00Z');
          const expectedStartDate = new Date(expectedEndDate);
          expectedStartDate.setMonth(expectedStartDate.getMonth() - months);

          expect(startDate.toISOString().split('T')[0]).toBe(expectedStartDate.toISOString().split('T')[0]);
          expect(endDate.toISOString().split('T')[0]).toBe(expectedEndDate.toISOString().split('T')[0]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('formatDateRangeForGitHub', () => {
  it('should format any valid date range correctly', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        (startDate: Date, endDate: Date) => {
          fc.pre(!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()));
          const result = formatDateRangeForGitHub(startDate, endDate);
          const expectedStart = startDate.toISOString().split('T')[0];
          const expectedEnd = endDate.toISOString().split('T')[0];
          expect(result).toBe(`${expectedStart}..${expectedEnd}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle same day correctly', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        (date: Date) => {
          fc.pre(!isNaN(date.getTime()));
          const result = formatDateRangeForGitHub(date, date);
          const expected = date.toISOString().split('T')[0];
          expect(result).toBe(`${expected}..${expected}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('formatDateForDisplay', () => {
  it('should format any date correctly', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        (date: Date) => {
          fc.pre(!isNaN(date.getTime()));
          const result = formatDateForDisplay(date);
          const month = date.toLocaleString('default', { month: 'long' });
          const day = date.getDate();
          const year = date.getFullYear();
          expect(result).toBe(`${month} ${day}, ${year}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('isValidDateFormat', () => {
  it('should accept valid YYYY-MM-DD dates', () => {
    expect(isValidDateFormat('2025-01-15')).toBe(true);
    expect(isValidDateFormat('2024-12-31')).toBe(true);
    expect(isValidDateFormat('2000-06-01')).toBe(true);
  });

  it('should reject invalid date formats', () => {
    expect(isValidDateFormat('01-15-2025')).toBe(false);
    expect(isValidDateFormat('2025/01/15')).toBe(false);
    expect(isValidDateFormat('invalid')).toBe(false);
    expect(isValidDateFormat('2025-1-15')).toBe(false);
    expect(isValidDateFormat('2025-01-5')).toBe(false);
  });

  it('should reject invalid calendar dates', () => {
    expect(isValidDateFormat('2025-02-30')).toBe(false);
    expect(isValidDateFormat('2025-13-01')).toBe(false);
    expect(isValidDateFormat('2025-00-15')).toBe(false);
  });

  it('should handle leap years correctly', () => {
    expect(isValidDateFormat('2024-02-29')).toBe(true);
    expect(isValidDateFormat('2025-02-29')).toBe(false);
  });
});

describe('parseDate', () => {
  it('should parse valid date strings to UTC Date objects', () => {
    const date = parseDate('2025-01-15');
    expect(date.getUTCFullYear()).toBe(2025);
    expect(date.getUTCMonth()).toBe(0);
    expect(date.getUTCDate()).toBe(15);
  });

  it('should parse any valid YYYY-MM-DD string correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1970, max: 2100 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        (year, month, day) => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const parsed = parseDate(dateStr);
          expect(parsed.getUTCFullYear()).toBe(year);
          expect(parsed.getUTCMonth()).toBe(month - 1);
          expect(parsed.getUTCDate()).toBe(day);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('isDateRangeWithinLimit', () => {
  it('should return true for ranges within the limit', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-06-01');
    expect(isDateRangeWithinLimit(start, end, 36)).toBe(true);
  });

  it('should return true for exactly 36 months', () => {
    const start = new Date('2022-01-01');
    const end = new Date('2025-01-01');
    expect(isDateRangeWithinLimit(start, end, 36)).toBe(true);
  });

  it('should return false for ranges exceeding the limit', () => {
    const start = new Date('2022-01-01');
    const end = new Date('2025-02-01');
    expect(isDateRangeWithinLimit(start, end, 36)).toBe(false);
  });

  it('should handle same date', () => {
    const date = new Date('2025-01-01');
    expect(isDateRangeWithinLimit(date, date, 36)).toBe(true);
  });
});

describe('isStartBeforeEnd', () => {
  it('should return true when start is before end', () => {
    const start = new Date('2025-01-01');
    const end = new Date('2025-06-01');
    expect(isStartBeforeEnd(start, end)).toBe(true);
  });

  it('should return true when start equals end', () => {
    const date = new Date('2025-01-01');
    expect(isStartBeforeEnd(date, date)).toBe(true);
  });

  it('should return false when start is after end', () => {
    const start = new Date('2025-06-01');
    const end = new Date('2025-01-01');
    expect(isStartBeforeEnd(start, end)).toBe(false);
  });

  it('should work for any pair of dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        (date1, date2) => {
          fc.pre(!isNaN(date1.getTime()) && !isNaN(date2.getTime()));
          const result = isStartBeforeEnd(date1, date2);
          expect(result).toBe(date1.getTime() <= date2.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });
});
