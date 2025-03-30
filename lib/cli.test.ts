import { isValidGitHubUsername, isValidMonths } from './cli.js';

describe('CLI Validation Functions', () => {
  describe('isValidGitHubUsername', () => {
    it('should accept valid GitHub usernames', () => {
      const validUsernames = [
        'bostonaholic',
        'user123',
        'user-name',
        'user_name',
        '123user',
        'a'
      ];

      validUsernames.forEach(username => {
        expect(isValidGitHubUsername(username)).toBe(true);
      });
    });

    it('should reject invalid GitHub usernames', () => {
      const invalidUsernames = [
        'user name', // contains space
        'user@name', // contains special character
        'user/name', // contains slash
        '', // empty string
        'user.name', // contains dot
        'user:name'  // contains colon
      ];

      invalidUsernames.forEach(username => {
        expect(isValidGitHubUsername(username)).toBe(false);
      });
    });
  });

  describe('isValidMonths', () => {
    it('should accept positive numbers', () => {
      const validMonths = [1, 2, 3, 12, 24, 100];

      validMonths.forEach(months => {
        expect(isValidMonths(months)).toBe(true);
      });
    });

    it('should reject non-positive numbers', () => {
      const invalidMonths = [0, -1, -2, -3, -12, -24, -100];

      invalidMonths.forEach(months => {
        expect(isValidMonths(months)).toBe(false);
      });
    });
  });
}); 