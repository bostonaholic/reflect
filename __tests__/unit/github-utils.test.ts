import { buildOrgFilter } from '../../lib/github-utils.js';
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