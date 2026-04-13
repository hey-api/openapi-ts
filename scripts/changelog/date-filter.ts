export const RELEASE_DATE_FILTER_ENV = 'RELEASE_DATE_FILTER';

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface DateRangeFilter {
  endDate: string;
  raw: string;
  startDate: string;
}

function assertCalendarDate(value: string): string {
  const match = value.match(DATE_PATTERN);
  if (!match) {
    throw new Error(
      `Invalid ${RELEASE_DATE_FILTER_ENV} value "${value}". Expected YYYY-MM-DD date format.`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const normalized = new Date(Date.UTC(year, month - 1, day));

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() !== month - 1 ||
    normalized.getUTCDate() !== day
  ) {
    throw new Error(
      `Invalid ${RELEASE_DATE_FILTER_ENV} value "${value}". Date is not a valid calendar day.`,
    );
  }

  return value;
}

export function parseDateRangeFilter(rawValue: string): DateRangeFilter {
  const value = rawValue.trim();
  if (!value) {
    throw new Error(
      `Invalid ${RELEASE_DATE_FILTER_ENV} value. Expected YYYY-MM-DD or YYYY-MM-DD..YYYY-MM-DD.`,
    );
  }

  if (!value.includes('..')) {
    const date = assertCalendarDate(value);
    return {
      endDate: date,
      raw: value,
      startDate: date,
    };
  }

  const parts = value.split('..');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid ${RELEASE_DATE_FILTER_ENV} value "${value}". Expected YYYY-MM-DD..YYYY-MM-DD.`,
    );
  }

  const startDate = assertCalendarDate(parts[0]);
  const endDate = assertCalendarDate(parts[1]);

  if (startDate > endDate) {
    throw new Error(
      `Invalid ${RELEASE_DATE_FILTER_ENV} value "${value}". Start date must be before or equal to end date.`,
    );
  }

  return {
    endDate,
    raw: value,
    startDate,
  };
}

export function getDateRangeFilterFromEnv(env = process.env): DateRangeFilter | undefined {
  const rawValue = env[RELEASE_DATE_FILTER_ENV];
  if (!rawValue) return;

  return parseDateRangeFilter(rawValue);
}
