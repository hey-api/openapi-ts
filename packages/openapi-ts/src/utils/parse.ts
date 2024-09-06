import type { Operation, OperationParameter } from '../openApi';
import { sanitizeNamespaceIdentifier } from '../openApi';
import { camelCase } from './camelCase';
import { getConfig, isStandaloneClient } from './config';
import { transformTypeKeyName } from './type';

export const operationFilterFn = (operation: Operation): boolean => {
  const config = getConfig();

  const regexp = config.services.filter
    ? new RegExp(config.services.filter)
    : undefined;
  const operationKey = `${operation.method} ${operation.path}`;
  return !regexp || regexp.test(operationKey);
};

export const operationParameterFilterFn = (
  parameter: OperationParameter,
): boolean => {
  const config = getConfig();

  // legacy clients ignore the "api-version" param since we do not want to
  // add it as the first/default parameter for each of the service calls
  return isStandaloneClient(config) || parameter.prop !== 'api-version';
};

/**
 * Convert the input value to a correct operation (method) class name.
 * This will use the operation ID - if available - and otherwise fallback
 * on a generated name from the URL
 */
export const operationNameFn = (operation: Omit<Operation, 'name'>): string => {
  const config = getConfig();

  if (config.services.operationId && operation.id) {
    return camelCase({
      input: sanitizeNamespaceIdentifier(operation.id),
    });
  }

  let urlWithoutPlaceholders = operation.path;

  // legacy clients ignore the "api-version" param since we do not want to
  // add it as the first/default parameter for each of the service calls
  if (!isStandaloneClient(config)) {
    urlWithoutPlaceholders = urlWithoutPlaceholders.replace(
      /[^/]*?{api-version}.*?\//g,
      '',
    );
  }

  urlWithoutPlaceholders = urlWithoutPlaceholders
    .replace(/{(.*?)}/g, 'by-$1')
    // replace slashes with hyphens for camelcase method at the end
    .replace(/\//g, '-');

  return camelCase({
    input: `${operation.method}-${urlWithoutPlaceholders}`,
  });
};

export const operationParameterNameFn = (
  parameter: Omit<OperationParameter, 'name'>,
): string => {
  const config = getConfig();

  return isStandaloneClient(config)
    ? parameter.prop
    : transformTypeKeyName(parameter.prop);
};
