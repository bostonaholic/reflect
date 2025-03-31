import { buildOrgFilter } from '../../lib/github-utils.js';

describe('buildOrgFilter', () => {
  it('should return empty string when no orgs provided', () => {
    expect(buildOrgFilter()).toBe('');
    expect(buildOrgFilter(undefined, undefined)).toBe('');
    expect(buildOrgFilter([], [])).toBe('');
  });

  it('should build include filter with single org', () => {
    expect(buildOrgFilter(['Shopify'])).toBe(' org:Shopify');
  });

  it('should build include filter with multiple orgs', () => {
    expect(buildOrgFilter(['Shopify', 'github'])).toBe(' org:Shopify org:github');
  });

  it('should build exclude filter with single org', () => {
    expect(buildOrgFilter(undefined, ['shopify'])).toBe(' -org:shopify');
  });

  it('should build exclude filter with multiple orgs', () => {
    expect(buildOrgFilter(undefined, ['shopify', 'github'])).toBe(' -org:shopify -org:github');
  });

  it('should prioritize include filter over exclude filter', () => {
    expect(buildOrgFilter(['shopify'], ['github'])).toBe(' org:shopify');
  });

  it('should handle empty arrays', () => {
    expect(buildOrgFilter([])).toBe('');
    expect(buildOrgFilter(undefined, [])).toBe('');
  });
}); 