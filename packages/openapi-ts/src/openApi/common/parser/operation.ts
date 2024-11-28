import type { Config } from '../../../types/config';
import { getConfig, isLegacyClient } from '../../../utils/config';
import { stringCase } from '../../../utils/stringCase';
import { transformTypeKeyName } from '../../../utils/type';
import type {
  OperationParameter,
  OperationResponse,
} from '../interfaces/client';
import { sanitizeNamespaceIdentifier } from './sanitize';

export const getOperationKey = (operation: {
  method: string;
  path: string;
}) => {
  const operationKey = `${operation.method.toUpperCase()} ${operation.path}`;
  return operationKey;
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
 * Does this operation have at least one required parameter?
 * @returns boolean
 */
export const isOperationParameterRequired = (
  parameters: OperationParameter[],
) => {
  const isRequired = parameters.some((parameter) => parameter.isRequired);
  return isRequired;
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

export const sorterByResponseStatusCode = (
  a: OperationResponse,
  b: OperationResponse,
) => {
  if (a.code > b.code) {
    return 1;
  }

  if (a.code < b.code) {
    return -1;
  }

  return 0;
};

const isErrorStatusCode = (code: OperationResponse['code']) =>
  code === '3XX' ||
  code === '4XX' ||
  code === '5XX' ||
  (typeof code === 'number' && code >= 300);

const isSuccessStatusCode = (code: OperationResponse['code']) =>
  code === '2XX' || (typeof code === 'number' && code >= 200 && code < 300);

/**
 * Detects whether default response is meant to be used
 * for error or success response.
 */
const inferDefaultResponseTypes = (
  response: OperationResponse,
  responses: OperationResponse[],
) => {
  let types: Array<'error' | 'success'> = [];

  const addResponseType = (type: (typeof types)[number]) => {
    if (!types.includes(type)) {
      types = [...types, type];
    }
  };

  const hasSuccessResponse = responses.some(({ code }) =>
    isSuccessStatusCode(code),
  );
  if (!hasSuccessResponse) {
    addResponseType('success');
  }

  const description = (response.description ?? '').toLocaleLowerCase();
  const $refs = response.$refs.join('|').toLocaleLowerCase();

  // must be in lowercase
  const errorKeywords = ['error', 'problem'];
  const successKeywords = ['success'];

  if (
    successKeywords.some(
      (keyword) => description.includes(keyword) || $refs.includes(keyword),
    )
  ) {
    addResponseType('success');
  }

  if (
    errorKeywords.some(
      (keyword) => description.includes(keyword) || $refs.includes(keyword),
    )
  ) {
    addResponseType('error');
  }

  if (!types.length) {
    addResponseType('error');
  }

  return types;
};

export const operationFilterFn = ({
  config,
  operationKey,
}: {
  config: Config;
  operationKey: string;
}): boolean => {
  const regexp = config.plugins['@hey-api/sdk']?.filter
    ? new RegExp(config.plugins['@hey-api/sdk']?.filter)
    : undefined;
  return !regexp || regexp.test(operationKey);
};

/**
 * Convert the input value to a correct operation (method) class name.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const operationNameFn = ({
  config,
  method,
  operationId,
  path,
}: {
  config: Config;
  method: string;
  operationId: string | undefined;
  path: string;
}): string => {
  if (config.plugins['@hey-api/sdk']?.operationId && operationId) {
    return stringCase({
      case: 'camelCase',
      value: sanitizeNamespaceIdentifier(operationId),
    });
  }

  let urlWithoutPlaceholders = path;

  // legacy clients ignore the "api-version" param since we do not want to
  // add it as the first/default parameter for each of the service calls
  if (isLegacyClient(config)) {
    urlWithoutPlaceholders = urlWithoutPlaceholders.replace(
      /[^/]*?{api-version}.*?\//g,
      '',
    );
  }

  urlWithoutPlaceholders = urlWithoutPlaceholders
    .replace(/{(.*?)}/g, 'by-$1')
    // replace slashes with hyphens for camelcase method at the end
    .replace(/[/:]/g, '-');

  return stringCase({
    case: 'camelCase',
    value: `${method}-${urlWithoutPlaceholders}`,
  });
};

export const operationParameterFilterFn = (
  parameter: OperationParameter,
): boolean => {
  const config = getConfig();

  // legacy clients ignore the "api-version" param since we do not want to
  // add it as the first/default parameter for each of the service calls
  return !isLegacyClient(config) || parameter.prop !== 'api-version';
};

export const operationParameterNameFn = (
  parameter: Omit<OperationParameter, 'name'>,
): string => {
  const config = getConfig();

  return !isLegacyClient(config)
    ? parameter.prop
    : transformTypeKeyName(parameter.prop);
};

export const tagResponseTypes = (responses: OperationResponse[]) =>
  responses.map((response) => {
    const { code } = response;
    if (code === 'default') {
      response.responseTypes = inferDefaultResponseTypes(response, responses);
    } else if (isSuccessStatusCode(code)) {
      response.responseTypes = ['success'];
    } else if (isErrorStatusCode(code)) {
      response.responseTypes = ['error'];
    }
    return response;
  });
