import { buildOrgFilter, buildRepoFilter } from '../../lib/github-utils.js';
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
        fc.array(fc.string(), { minLength: 1 }),
        fc.array(fc.string(), { minLength: 1 }),
        (includeOrgs, excludeOrgs) => {
          const result = buildOrgFilter(includeOrgs, excludeOrgs);
          return result.startsWith(' org:') && !result.includes('-org:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format include filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1 }),
        (includeOrgs) => {
          const result = buildOrgFilter(includeOrgs);
          return includeOrgs.every(org => result.includes(` org:${org}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format exclude filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1 }),
        (excludeOrgs) => {
          const result = buildOrgFilter(undefined, excludeOrgs);
          return excludeOrgs.every(org => result.includes(` -org:${org}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of includeOrgs in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2 }),
        (includeOrgs) => {
          const result = buildOrgFilter(includeOrgs);
          const orgsInOrder = includeOrgs.map(org => ` org:${org}`).join('');
          return result === orgsInOrder;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of excludeOrgs in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2 }),
        (excludeOrgs) => {
          const result = buildOrgFilter(undefined, excludeOrgs);
          const orgsInOrder = excludeOrgs.map(org => ` -org:${org}`).join('');
          return result === orgsInOrder;
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
        fc.array(fc.string(), { minLength: 1 }),
        fc.array(fc.string(), { minLength: 1 }),
        (includeRepos, excludeRepos) => {
          const result = buildRepoFilter(includeRepos, excludeRepos);
          return result.startsWith(' repo:') && !result.includes('-repo:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format include repository filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1 }),
        (includeRepos) => {
          const result = buildRepoFilter(includeRepos);
          return includeRepos.every(repo => result.includes(` repo:${repo}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format exclude repository filters consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1 }),
        (excludeRepos) => {
          const result = buildRepoFilter(undefined, excludeRepos);
          return excludeRepos.every(repo => result.includes(` -repo:${repo}`));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of includeRepos in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2 }),
        (includeRepos) => {
          const result = buildRepoFilter(includeRepos);
          const reposInOrder = includeRepos.map(repo => ` repo:${repo}`).join('');
          return result === reposInOrder;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve order of excludeRepos in output', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 2 }),
        (excludeRepos) => {
          const result = buildRepoFilter(undefined, excludeRepos);
          const reposInOrder = excludeRepos.map(repo => ` -repo:${repo}`).join('');
          return result === reposInOrder;
        }
      ),
      { numRuns: 100 }
    );
  });
});