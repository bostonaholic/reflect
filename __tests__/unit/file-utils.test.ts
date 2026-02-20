import { ALLOWED_FILES, sanitizeFilename, promptForLocalFile, writeFileSafely } from '../../lib/utils/file-utils.js';
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as readline from 'readline';

vi.mock('fs/promises');
vi.mock('readline');

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

describe('promptForLocalFile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null when file does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const result = await promptForLocalFile('contributions.md');
    expect(result).toBeNull();
    expect(readline.createInterface).not.toHaveBeenCalled();
  });

  it('should return file contents when user presses enter (default yes)', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('# Contributions\nSome content');
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb(''));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);

    const result = await promptForLocalFile('contributions.md');
    expect(result).toBe('# Contributions\nSome content');
  });

  it('should return file contents when user answers "y"', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('content');
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb('y'));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);

    const result = await promptForLocalFile('contributions.md');
    expect(result).toBe('content');
  });

  it('should return null when user answers "n"', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb('n'));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);

    const result = await promptForLocalFile('contributions.md');
    expect(result).toBeNull();
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it('should close the readline interface', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb('y'));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);
    vi.mocked(fs.readFile).mockResolvedValue('content');

    await promptForLocalFile('contributions.md');
    expect(mockRl.close).toHaveBeenCalled();
  });

  it('should throw for invalid filenames', async () => {
    await expect(promptForLocalFile('evil.txt')).rejects.toThrow('Invalid output filename');
  });
});

describe('writeFileSafely', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  it('should write without prompting when forceOverwrite is true', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined); // file exists

    const result = await writeFileSafely('contributions.md', 'new content', { forceOverwrite: true });

    expect(result).toEqual({ content: 'new content', didWrite: true });
    expect(fs.writeFile).toHaveBeenCalledWith('output/contributions.md', 'new content');
    expect(readline.createInterface).not.toHaveBeenCalled();
  });

  it('should prompt when file exists and forceOverwrite is not set', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined); // file exists
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb('y'));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);

    const result = await writeFileSafely('contributions.md', 'new content');

    expect(result).toEqual({ content: 'new content', didWrite: true });
    expect(readline.createInterface).toHaveBeenCalled();
  });

  it('should not prompt when file does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    const result = await writeFileSafely('contributions.md', 'new content');

    expect(result).toEqual({ content: 'new content', didWrite: true });
    expect(readline.createInterface).not.toHaveBeenCalled();
  });

  it('should return existing content when user declines overwrite', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined); // file exists
    vi.mocked(fs.readFile).mockResolvedValue('existing content');
    const mockRl = { question: vi.fn(), close: vi.fn() };
    mockRl.question.mockImplementation((_prompt: string, cb: (answer: string) => void) => cb('N'));
    vi.mocked(readline.createInterface).mockReturnValue(mockRl as unknown as readline.Interface);

    const result = await writeFileSafely('contributions.md', 'new content');

    expect(result).toEqual({ content: 'existing content', didWrite: false });
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
