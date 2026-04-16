import { describe, expect, it } from 'vitest';

import {
  getDateRangeFilterFromEnv,
  parseDateRangeFilter,
  RELEASE_DATE_FILTER_ENV,
} from '../scripts/changelog/date-filter';

describe('changelog date filter', () => {
  describe('parseDateRangeFilter', () => {
    it('accepts a single date', () => {
      expect(parseDateRangeFilter('2026-04-10')).toEqual({
        endDate: '2026-04-10',
        raw: '2026-04-10',
        startDate: '2026-04-10',
      });
    });

    it('accepts an inclusive date range', () => {
      expect(parseDateRangeFilter('2026-04-01..2026-04-10')).toEqual({
        endDate: '2026-04-10',
        raw: '2026-04-01..2026-04-10',
        startDate: '2026-04-01',
      });
    });

    it('rejects invalid format', () => {
      expect(() => parseDateRangeFilter('2026/04/01')).toThrow(
        `Invalid ${RELEASE_DATE_FILTER_ENV} value "2026/04/01". Expected YYYY-MM-DD date format.`,
      );
    });

    it('rejects invalid calendar date', () => {
      expect(() => parseDateRangeFilter('2026-02-30')).toThrow(
        `Invalid ${RELEASE_DATE_FILTER_ENV} value "2026-02-30". Date is not a valid calendar day.`,
      );
    });

    it('rejects malformed ranges', () => {
      expect(() => parseDateRangeFilter('2026-04-01..')).toThrow(
        `Invalid ${RELEASE_DATE_FILTER_ENV} value "2026-04-01..". Expected YYYY-MM-DD..YYYY-MM-DD.`,
      );
      expect(() => parseDateRangeFilter('..2026-04-10')).toThrow(
        `Invalid ${RELEASE_DATE_FILTER_ENV} value "..2026-04-10". Expected YYYY-MM-DD..YYYY-MM-DD.`,
      );
    });

    it('rejects inverted ranges', () => {
      expect(() => parseDateRangeFilter('2026-04-10..2026-04-01')).toThrow(
        `Invalid ${RELEASE_DATE_FILTER_ENV} value "2026-04-10..2026-04-01". Start date must be before or equal to end date.`,
      );
    });
  });

  describe('getDateRangeFilterFromEnv', () => {
    it('returns undefined when env var is not set', () => {
      expect(getDateRangeFilterFromEnv({})).toBeUndefined();
    });

    it('parses env var when set', () => {
      expect(
        getDateRangeFilterFromEnv({
          [RELEASE_DATE_FILTER_ENV]: '2026-04-01..2026-04-10',
        }),
      ).toEqual({
        endDate: '2026-04-10',
        raw: '2026-04-01..2026-04-10',
        startDate: '2026-04-01',
      });
    });
  });
});
