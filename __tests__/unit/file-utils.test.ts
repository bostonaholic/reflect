import { ALLOWED_FILES, sanitizeFilename } from '../../lib/utils/file-utils.js';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('sanitizeFilename', () => {
  it('should allow valid filenames', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALLOWED_FILES),
        (filename: string) => {
          expect(sanitizeFilename(filename)).toBe(filename);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should throw error for invalid filenames', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !ALLOWED_FILES.includes(s)),
        (filename: string) => {
          expect(() => sanitizeFilename(filename)).toThrow('Invalid output filename');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject path traversal attempts', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2 }).map(s => s + '..' + s),
        (filename: string) => {
          expect(() => sanitizeFilename(filename)).toThrow('Invalid output filename');
        }
      ),
      { numRuns: 100 }
    );
  });
});