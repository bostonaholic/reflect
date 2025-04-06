import { isValidGitHubUsername, isValidMonths, isValidDateFormat, isValidDate, isDateOverThreeYearsAgo, isDateInFuture } from '../../lib/cli.js';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('CLI Validation Functions', () => {
  describe('isValidGitHubUsername', () => {
    it('should accept valid GitHub usernames', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 39 }),
          (username: string) => {
            // Only test if the username matches the pattern
            if (/^[a-zA-Z0-9_-]+$/.test(username)) {
              expect(isValidGitHubUsername(username)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid GitHub usernames', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (username: string) => {
            // Only test if the username contains invalid characters
            if (/[^a-zA-Z0-9_-]/.test(username)) {
              expect(isValidGitHubUsername(username)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject usernames longer than 39 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 40 }),
          (username: string) => {
            // Only test if the username contains valid characters
            if (/^[a-zA-Z0-9_-]+$/.test(username)) {
              expect(isValidGitHubUsername(username)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty usernames', () => {
      fc.assert(
        fc.property(
          fc.constant(''),
          (username: string) => {
            expect(isValidGitHubUsername(username)).toBe(false);
          }
        ),
        { numRuns: 1 }
      );
    });
  });

  describe('isValidMonths', () => {
    it('should accept valid months (1-36)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 36 }),
          (months: number) => {
            expect(isValidMonths(months)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-positive numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ max: 0 }),
          (months: number) => {
            expect(isValidMonths(months)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject months greater than 36', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 37 }),
          (months: number) => {
            expect(isValidMonths(months)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('isValidDateFormat', () => {
    it('should accept valid date format (YYYY-MM-DD)', () => {
      expect(isValidDateFormat('2023-01-01')).toBe(true);
      expect(isValidDateFormat('2024-12-31')).toBe(true);
      expect(isValidDateFormat('1990-05-15')).toBe(true);
      // Supports invalid dates, as we're just using regex to check format
      expect(isValidDateFormat('2023-13-01')).toBe(true);
      expect(isValidDateFormat('2023-01-32')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateFormat('01-01-2023')).toBe(false);
      expect(isValidDateFormat('2023/01/01')).toBe(false);
      expect(isValidDateFormat('2023-1-1')).toBe(false);
      expect(isValidDateFormat('abcd-ef-gh')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should accept valid dates', () => {
      expect(isValidDate('2023-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('1990-05-15')).toBe(true);
    });

    it('should reject invalid dates, following the YYYY-MM-DD format', () => {
      expect(isValidDate('2023-01-32')).toBe(false);
      expect(isValidDate('2025-02-31')).toBe(false);
    });
  });

  describe('isDateOverThreeYearsAgo', () => {
    it('should accept dates over 3 years ago', () => {
      const today = new Date();
      const threeYearsAndOneDayAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate() - 1);
      expect(isDateOverThreeYearsAgo(threeYearsAndOneDayAgo)).toBe(true);
    });

    it('should reject dates within the last 3 years', () => {
      const today = new Date();
      const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
      expect(isDateOverThreeYearsAgo(threeYearsAgo)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('should accept dates in the future', () => {
      const today = new Date();
      const oneDayInFuture = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      expect(isDateInFuture(oneDayInFuture)).toBe(true);
    });

    it('should reject dates in the past', () => {
      const today = new Date();
      const oneDayInPast = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      expect(isDateInFuture(oneDayInPast)).toBe(false);
    });
  });
});
