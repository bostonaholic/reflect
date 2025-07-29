import { isValidGitHubUsername, isValidMonths, isValidRepo } from '../../lib/core/cli.js';
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
});