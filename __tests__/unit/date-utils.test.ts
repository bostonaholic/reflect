import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from '../../lib/date-utils.js';
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