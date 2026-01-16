import { isValidGitHubUsername, isValidMonths, isValidRepo, validateDateMode, validateDateInputs } from '../../lib/core/cli.js';
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

class ExitError extends Error {
  constructor(public code: number) {
    super(`process.exit(${code})`);
  }
}

function mockProcessExit() {
  let mockExit: MockInstance;
  let mockConsoleError: MockInstance;

  beforeEach(() => {
    mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new ExitError(code as number);
    });
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  return { getMockExit: () => mockExit };
}

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

  describe('isValidRepo', () => {
    it('should accept valid owner/repo strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          fc.string({ minLength: 1 }).filter(s => /^[a-zA-Z0-9_.-]+$/.test(s)),
          (owner, name) => {
            expect(isValidRepo(`${owner}/${name}`)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid repo strings', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (repo) => {
            if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
              expect(isValidRepo(repo)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('validateDateMode', () => {
    const { getMockExit } = mockProcessExit();

    it('should pass with lookback only', () => {
      validateDateMode(6, undefined, undefined);
      expect(getMockExit()).not.toHaveBeenCalled();
    });

    it('should pass with both start and end dates', () => {
      validateDateMode(undefined, '2025-01-01', '2025-06-01');
      expect(getMockExit()).not.toHaveBeenCalled();
    });

    it('should error when lookback used with start date', () => {
      expect(() => validateDateMode(6, '2025-01-01', undefined)).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when lookback used with end date', () => {
      expect(() => validateDateMode(6, undefined, '2025-06-01')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when only start date provided', () => {
      expect(() => validateDateMode(undefined, '2025-01-01', undefined)).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when only end date provided', () => {
      expect(() => validateDateMode(undefined, undefined, '2025-06-01')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when no date mode specified', () => {
      expect(() => validateDateMode(undefined, undefined, undefined)).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });
  });

  describe('validateDateInputs', () => {
    const { getMockExit } = mockProcessExit();

    it('should pass with valid date range', () => {
      validateDateInputs('2025-01-01', '2025-06-01');
      expect(getMockExit()).not.toHaveBeenCalled();
    });

    it('should error with invalid start date format', () => {
      expect(() => validateDateInputs('01-01-2025', '2025-06-01')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error with invalid end date format', () => {
      expect(() => validateDateInputs('2025-01-01', '06-01-2025')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when start date is after end date', () => {
      expect(() => validateDateInputs('2025-06-01', '2025-01-01')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should error when date range exceeds 36 months', () => {
      expect(() => validateDateInputs('2020-01-01', '2025-01-01')).toThrow(ExitError);
      expect(getMockExit()).toHaveBeenCalledWith(1);
    });

    it('should pass with exactly 36 months', () => {
      validateDateInputs('2022-01-01', '2025-01-01');
      expect(getMockExit()).not.toHaveBeenCalled();
    });

    it('should pass with same start and end date', () => {
      validateDateInputs('2025-01-01', '2025-01-01');
      expect(getMockExit()).not.toHaveBeenCalled();
    });
  });
});
