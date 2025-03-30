import { sanitizeFilename } from '../file-utils.js';

describe('sanitizeFilename', () => {
  it('should allow valid filenames', () => {
    expect(sanitizeFilename('contributions.md')).toBe('contributions.md');
    expect(sanitizeFilename('summarized_contributions.md')).toBe('summarized_contributions.md');
    expect(sanitizeFilename('brag_document.md')).toBe('brag_document.md');
  });

  it('should throw error for invalid filenames', () => {
    expect(() => sanitizeFilename('invalid.md')).toThrow('Invalid output filename');
    expect(() => sanitizeFilename('../../etc/passwd')).toThrow('Invalid output filename');
  });
}); 