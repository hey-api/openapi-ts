import camelCase from 'camelcase';

import { getConfig } from '../../../utils/config';
import type { Model, OperationResponse } from '../interfaces/client';
import { sanitizeNamespaceIdentifier } from './sanitize';

const areEqual = (a: Model, b: Model): boolean => {
  const equal =
    a.type === b.type && a.base === b.base && a.template === b.template;
  if (equal && a.link && b.link) {
    return areEqual(a.link, b.link);
  }
  return equal;
};

/**
 * Convert the input value to a correct operation (method) class name.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const getOperationName = (
  url: string,
  method: string,
  operationId?: string,
): string => {
  const config = getConfig();

  if (config.services.operationId && operationId) {
    return camelCase(sanitizeNamespaceIdentifier(operationId).trim());
  }

  const urlWithoutPlaceholders = url
    .replace(/[^/]*?{api-version}.*?\//g, '')
    .replace(/{(.*?)}/g, 'by-$1')
    .replace(/\//g, '-');

  return camelCase(`${method}-${urlWithoutPlaceholders}`);
};

export const getOperationResponseHeader = (
  operationResponses: OperationResponse[],
): string | null => {
  const header = operationResponses.find(
    (operationResponses) => operationResponses.in === 'header',
  );
  if (header) {
    return header.name;
  }
  return null;
};

/**
 * Attempts to parse response status code from string into number.
 * @param value string status code from OpenAPI definition
 * @returns Parsed status code or null if invalid value
 */
export const parseResponseStatusCode = (
  value: string,
): OperationResponse['code'] | null => {
  if (value === 'default') {
    return 'default';
  }

  if (value === '1XX') {
    return '1XX';
  }

  if (value === '2XX') {
    return '2XX';
  }

  if (value === '3XX') {
    return '3XX';
  }

  if (value === '4XX') {
    return '4XX';
  }

  if (value === '5XX') {
    return '5XX';
  }

  if (/\d{3}/g.test(value)) {
    const code = Number.parseInt(value, 10);
    if (code >= 100 && code < 600) {
      return code;
    }
  }

  return null;
};

/**
 * Returns only error status code responses.
 */
export const getErrorResponses = (
  responses: OperationResponse[],
): OperationResponse[] => {
  const results = responses.filter(
    ({ code }) =>
      code === '3XX' ||
      code === '4XX' ||
      code === '5XX' ||
      (typeof code === 'number' && code >= 300),
  );
  return results;
};

/**
 * Returns only successful status code responses.
 */
export const getSuccessResponses = (
  responses: OperationResponse[],
): OperationResponse[] => {
  const results = responses.filter(
    ({ code }) =>
      code === 'default' ||
      code === '2XX' ||
      (typeof code === 'number' && code >= 200 && code < 300),
  );
  return results.filter(
    (result, index, arr) =>
      arr.findIndex((item) => areEqual(item, result)) === index,
  );
};
