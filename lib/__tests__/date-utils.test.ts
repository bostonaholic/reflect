import { jest } from '@jest/globals';
import { calculateDateRange, formatDateRangeForGitHub, formatDateForDisplay } from '../date-utils.js';

describe('calculateDateRange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-30T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate correct date range for 1 month', () => {
    const { startDate, endDate } = calculateDateRange(1);
    expect(startDate.toISOString().split('T')[0]).toBe('2024-03-01');
    expect(endDate.toISOString().split('T')[0]).toBe('2024-03-30');
  });

  it('should calculate correct date range for 3 months', () => {
    const { startDate, endDate } = calculateDateRange(3);
    expect(startDate.toISOString().split('T')[0]).toBe('2023-12-30');
    expect(endDate.toISOString().split('T')[0]).toBe('2024-03-30');
  });

  it('should calculate correct date range for 12 months', () => {
    const { startDate, endDate } = calculateDateRange(12);
    expect(startDate.toISOString().split('T')[0]).toBe('2023-03-30');
    expect(endDate.toISOString().split('T')[0]).toBe('2024-03-30');
  });
});

describe('formatDateRangeForGitHub', () => {
  it('should format date range correctly', () => {
    const startDate = new Date('2024-01-01T12:00:00Z');
    const endDate = new Date('2024-03-30T12:00:00Z');
    const result = formatDateRangeForGitHub(startDate, endDate);
    expect(result).toBe('2024-01-01..2024-03-30');
  });

  it('should handle same day', () => {
    const date = new Date('2024-03-30T12:00:00Z');
    const result = formatDateRangeForGitHub(date, date);
    expect(result).toBe('2024-03-30..2024-03-30');
  });
});

describe('formatDateForDisplay', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-03-30T12:00:00Z');
    const result = formatDateForDisplay(date);
    expect(result).toBe('March 30, 2024');
  });

  it('should handle different months', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = formatDateForDisplay(date);
    expect(result).toBe('January 15, 2024');
  });

  it('should handle different years', () => {
    const date = new Date('2023-12-31T12:00:00Z');
    const result = formatDateForDisplay(date);
    expect(result).toBe('December 31, 2023');
  });
}); 