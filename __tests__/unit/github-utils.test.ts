import { buildOrgFilter, buildRepoFilter, deduplicateByUrl, fetchGitHubData } from '../../lib/integrations/github/github-utils.js';
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubPr, GitHubIssue } from '../../lib/core/types.js';

vi.mock('../../lib/integrations/github/github.js', () => ({
  fetchMergedPRs: vi.fn().mockResolvedValue([]),
  fetchClosedIssues: vi.fn().mockResolvedValue([]),
  fetchReviewedPRs: vi.fn().mockResolvedValue([]),
}));

import { fetchMergedPRs, fetchClosedIssues, fetchReviewedPRs } from '../../lib/integrations/github/github.js';

const mockedFetchMergedPRs = vi.mocked(fetchMergedPRs);
const mockedFetchClosedIssues = vi.mocked(fetchClosedIssues);
const mockedFetchReviewedPRs = vi.mocked(fetchReviewedPRs);

function makePr(url: string): GitHubPr {
  return {
    type: 'pr',
    url,
    title: `PR ${url}`,
    permalink: null,
    body: '',
    closedAt: '2025-01-01',
    repository: 'test/repo',
    comments: [],
    reviews: [],
  };
}

function makeIssue(url: string): GitHubIssue {
  return {
    type: 'issue',
    url,
    title: `Issue ${url}`,
    permalink: null,
    body: '',
    closedAt: '2025-01-01',
    repository: 'test/repo',
    comments: [],
  };
}

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

describe('deduplicateByUrl', () => {
  it('should remove duplicates based on url', () => {
    const items = [
      makePr('https://github.com/org/repo/pull/1'),
      makePr('https://github.com/org/repo/pull/2'),
      makePr('https://github.com/org/repo/pull/1'),
    ];
    const result = deduplicateByUrl(items);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.url)).toEqual([
      'https://github.com/org/repo/pull/1',
      'https://github.com/org/repo/pull/2',
    ]);
  });

  it('should preserve first occurrence when duplicates exist', () => {
    const first = makePr('https://github.com/org/repo/pull/1');
    first.title = 'First';
    const duplicate = makePr('https://github.com/org/repo/pull/1');
    duplicate.title = 'Duplicate';
    const result = deduplicateByUrl([first, duplicate]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('First');
  });

  it('should return empty array for empty input', () => {
    expect(deduplicateByUrl([])).toEqual([]);
  });

  it('should return all items when no duplicates', () => {
    const items = [
      makePr('https://github.com/org/repo/pull/1'),
      makePr('https://github.com/org/repo/pull/2'),
      makePr('https://github.com/org/repo/pull/3'),
    ];
    expect(deduplicateByUrl(items)).toHaveLength(3);
  });

  it('should work with issues', () => {
    const items = [
      makeIssue('https://github.com/org/repo/issues/1'),
      makeIssue('https://github.com/org/repo/issues/1'),
      makeIssue('https://github.com/org/repo/issues/2'),
    ];
    const result = deduplicateByUrl(items);
    expect(result).toHaveLength(2);
  });
});

describe('fetchGitHubData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFetchMergedPRs.mockResolvedValue([]);
    mockedFetchClosedIssues.mockResolvedValue([]);
    mockedFetchReviewedPRs.mockResolvedValue([]);
  });

  it('should call fetch functions once with single org', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01', ['Shopify']);

    expect(mockedFetchMergedPRs).toHaveBeenCalledTimes(1);
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', ['Shopify'], undefined, undefined, undefined
    );
    expect(mockedFetchClosedIssues).toHaveBeenCalledTimes(1);
    expect(mockedFetchReviewedPRs).toHaveBeenCalledTimes(1);
  });

  it('should call fetch functions once with no filters', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01');

    expect(mockedFetchMergedPRs).toHaveBeenCalledTimes(1);
    expect(mockedFetchClosedIssues).toHaveBeenCalledTimes(1);
    expect(mockedFetchReviewedPRs).toHaveBeenCalledTimes(1);
  });

  it('should query each org separately with multiple include orgs', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01', ['Shopify', 'shop']);

    expect(mockedFetchMergedPRs).toHaveBeenCalledTimes(2);
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', ['Shopify'], undefined, undefined, undefined, true
    );
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', ['shop'], undefined, undefined, undefined, true
    );
    expect(mockedFetchClosedIssues).toHaveBeenCalledTimes(2);
    expect(mockedFetchReviewedPRs).toHaveBeenCalledTimes(2);
  });

  it('should deduplicate results by URL across multiple org queries', async () => {
    const sharedPr = makePr('https://github.com/Shopify/world/pull/1');
    const uniquePr = makePr('https://github.com/shop/app/pull/2');

    mockedFetchMergedPRs
      .mockResolvedValueOnce([sharedPr])
      .mockResolvedValueOnce([sharedPr, uniquePr]);

    const result = await fetchGitHubData('user', '2025-01-01..2025-02-01', ['Shopify', 'shop']);

    expect(result.prs).toHaveLength(2);
    expect(result.prs.map(p => p.url)).toEqual([sharedPr.url, uniquePr.url]);
  });

  it('should pass exclude orgs through when iterating include orgs', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01', ['Shopify', 'shop'], ['private-org']);

    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', ['Shopify'], ['private-org'], undefined, undefined, true
    );
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', ['shop'], ['private-org'], undefined, undefined, true
    );
  });

  it('should not iterate when only exclude orgs are provided', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01', undefined, ['private-org', 'secret-org']);

    expect(mockedFetchMergedPRs).toHaveBeenCalledTimes(1);
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', undefined, ['private-org', 'secret-org'], undefined, undefined
    );
  });

  it('should query each repo separately with multiple include repos', async () => {
    await fetchGitHubData('user', '2025-01-01..2025-02-01', undefined, undefined, ['org/repo1', 'org/repo2']);

    expect(mockedFetchMergedPRs).toHaveBeenCalledTimes(2);
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', undefined, undefined, ['org/repo1'], undefined, true
    );
    expect(mockedFetchMergedPRs).toHaveBeenCalledWith(
      'user', '2025-01-01..2025-02-01', undefined, undefined, ['org/repo2'], undefined, true
    );
  });

  it('should deduplicate issues across multiple repo queries', async () => {
    const sharedIssue = makeIssue('https://github.com/org/repo1/issues/1');
    const uniqueIssue = makeIssue('https://github.com/org/repo2/issues/2');

    mockedFetchClosedIssues
      .mockResolvedValueOnce([sharedIssue])
      .mockResolvedValueOnce([sharedIssue, uniqueIssue]);

    const result = await fetchGitHubData('user', '2025-01-01..2025-02-01', undefined, undefined, ['org/repo1', 'org/repo2']);

    expect(result.issues).toHaveLength(2);
    expect(result.issues.map(i => i.url)).toEqual([sharedIssue.url, uniqueIssue.url]);
  });
});