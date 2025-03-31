import { sanitizeFilename } from '../../lib/file-utils.js';
import * as fc from 'fast-check';
import { describe, it, expect } from '@jest/globals';

describe('sanitizeFilename', () => {
  const validFilenames = ['contributions.md', 'summarized_contributions.md', 'brag_document.md'];

  it('should allow valid filenames', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validFilenames),
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
        fc.string().filter(s => !validFilenames.includes(s)),
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
        fc.string().filter(s => s.includes('..')),
        (filename: string) => {
          expect(() => sanitizeFilename(filename)).toThrow('Invalid output filename');
        }
      ),
      { numRuns: 100 }
    );
  });
}); 