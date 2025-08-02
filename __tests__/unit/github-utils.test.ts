import { buildOrgFilter, buildRepoFilter } from '../../lib/integrations/github/github-utils.js';
import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('buildOrgFilter', () => {
  it('should return empty string for undefined or empty arrays', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(undefined), fc.constant<string[]>([])),
        fc.oneof(fc.constant(undefined), fc.constant<string[]>([])),
        (includeOrgs, excludeOrgs) => {
          const result = buildOrgFilter(includeOrgs, excludeOrgs);
          return result === '';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prioritize includeOrgs over excludeOrgs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (includeOrgs, excludeOrgs) => {
          const result = buildOrgFilter(includeOrgs, excludeOrgs);
          return result.includes('org:') && !result.includes('-org:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format single org consistently', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
        (org) => {
          const result = buildOrgFilter([org]);
          return result === ` org:${org}`;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format multiple orgs with OR syntax', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 2, maxLength: 5 }),
        (includeOrgs) => {
          const result = buildOrgFilter(includeOrgs);
          return result.startsWith(' (') && 
                 result.endsWith(')') &&
                 includeOrgs.every(org => result.includes(`org:${org}`)) &&
                 result.includes(' OR ');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format exclude filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (excludeOrgs) => {
          const result = buildOrgFilter(undefined, excludeOrgs);
          return excludeOrgs.every(org => result.includes(`-org:${org}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of multiple includeOrgs in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 2, maxLength: 5 }),
        (includeOrgs) => {
          const result = buildOrgFilter(includeOrgs);
          const expectedPattern = ` (${includeOrgs.map(org => `org:${org}`).join(' OR ')})`;
          return result === expectedPattern;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of excludeOrgs in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (excludeOrgs) => {
          const result = buildOrgFilter(undefined, excludeOrgs);
          const expectedPattern = ` ${excludeOrgs.map(org => `-org:${org}`).join(' ')}`;
          return result === expectedPattern;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use OR syntax for multiple include orgs', () => {
    expect(buildOrgFilter(['shopify', 'github'])).toBe(' (org:shopify OR org:github)');
    expect(buildOrgFilter(['a', 'b', 'c'])).toBe(' (org:a OR org:b OR org:c)');
  });

  it('should not use parentheses for single org', () => {
    expect(buildOrgFilter(['shopify'])).toBe(' org:shopify');
  });

  it('should not use OR for exclude orgs', () => {
    expect(buildOrgFilter(undefined, ['shopify', 'github'])).toBe(' -org:shopify -org:github');
  });

  it('should handle empty strings and whitespace', () => {
    expect(buildOrgFilter(['', ' ', 'valid'])).toBe(' org:valid');
    expect(buildOrgFilter(['', ' '])).toBe('');
    expect(buildOrgFilter(['valid1', '', 'valid2'])).toBe(' (org:valid1 OR org:valid2)');
  });

  it('should handle empty strings in property tests', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.constant(''), fc.constant(' '), fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s))), { minLength: 1, maxLength: 5 }),
        (orgs) => {
          const result = buildOrgFilter(orgs);
          const validOrgs = orgs.map(org => org.trim()).filter(org => org.length > 0);
          if (validOrgs.length === 0) return result === '';
          if (validOrgs.length === 1) return result === ` org:${validOrgs[0]}`;
          return result === ` (${validOrgs.map(org => `org:${org}`).join(' OR ')})`;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('buildRepoFilter', () => {
  it('should return empty string for undefined or empty arrays', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(undefined), fc.constant<string[]>([])),
        fc.oneof(fc.constant(undefined), fc.constant<string[]>([])),
        (includeRepos, excludeRepos) => {
          const result = buildRepoFilter(includeRepos, excludeRepos);
          return result === '';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prioritize includeRepos over excludeRepos', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (includeRepos, excludeRepos) => {
          const result = buildRepoFilter(includeRepos, excludeRepos);
          return result.includes('repo:') && !result.includes('-repo:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format single repo consistently', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)),
        (repo) => {
          const result = buildRepoFilter([repo]);
          return result === ` repo:${repo}`;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format multiple repos with OR syntax', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 2, maxLength: 5 }),
        (includeRepos) => {
          const result = buildRepoFilter(includeRepos);
          return result.startsWith(' (') && 
                 result.endsWith(')') &&
                 includeRepos.every(repo => result.includes(`repo:${repo}`)) &&
                 result.includes(' OR ');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format exclude repository filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (excludeRepos) => {
          const result = buildRepoFilter(undefined, excludeRepos);
          return excludeRepos.every(repo => result.includes(`-repo:${repo}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of multiple includeRepos in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 2, maxLength: 5 }),
        (includeRepos) => {
          const result = buildRepoFilter(includeRepos);
          const expectedPattern = ` (${includeRepos.map(repo => `repo:${repo}`).join(' OR ')})`;
          return result === expectedPattern;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of excludeRepos in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s)), { minLength: 1, maxLength: 5 }),
        (excludeRepos) => {
          const result = buildRepoFilter(undefined, excludeRepos);
          const expectedPattern = ` ${excludeRepos.map(repo => `-repo:${repo}`).join(' ')}`;
          return result === expectedPattern;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use OR syntax for multiple include repos', () => {
    expect(buildRepoFilter(['bostonaholic/reflect', 'bostonaholic/dotfiles'])).toBe(' (repo:bostonaholic/reflect OR repo:bostonaholic/dotfiles)');
    expect(buildRepoFilter(['a/b', 'c/d', 'e/f'])).toBe(' (repo:a/b OR repo:c/d OR repo:e/f)');
  });

  it('should not use parentheses for single repo', () => {
    expect(buildRepoFilter(['bostonaholic/reflect'])).toBe(' repo:bostonaholic/reflect');
  });

  it('should not use OR for exclude repos', () => {
    expect(buildRepoFilter(undefined, ['bostonaholic/secret', 'bostonaholic/archived'])).toBe(' -repo:bostonaholic/secret -repo:bostonaholic/archived');
  });

  it('should handle empty strings and whitespace in repos', () => {
    expect(buildRepoFilter(['', ' ', 'valid/repo'])).toBe(' repo:valid/repo');
    expect(buildRepoFilter(['', ' '])).toBe('');
    expect(buildRepoFilter(['valid1/repo', '', 'valid2/repo'])).toBe(' (repo:valid1/repo OR repo:valid2/repo)');
  });

  it('should handle empty strings in repo property tests', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(fc.constant(''), fc.constant(' '), fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z0-9]+$/.test(s))), { minLength: 1, maxLength: 5 }),
        (repos) => {
          const result = buildRepoFilter(repos);
          const validRepos = repos.map(repo => repo.trim()).filter(repo => repo.length > 0);
          if (validRepos.length === 0) return result === '';
          if (validRepos.length === 1) return result === ` repo:${validRepos[0]}`;
          return result === ` (${validRepos.map(repo => `repo:${repo}`).join(' OR ')})`;
        }
      ),
      { numRuns: 100 }
    );
  });
});