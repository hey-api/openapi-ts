import type { Operation, OperationParameter } from '../openApi';
import { sanitizeNamespaceIdentifier } from '../openApi';
import { camelCase } from './camelCase';
import { getConfig, isLegacyClient } from './config';
import { transformTypeKeyName } from './type';

export const operationFilterFn = (operationKey: string): boolean => {
  const config = getConfig();
  const regexp = config.services.filter
    ? new RegExp(config.services.filter)
    : undefined;
  return !regexp || regexp.test(operationKey);
};

export const operationParameterFilterFn = (
  parameter: OperationParameter,
): boolean => {
  const config = getConfig();

  // legacy clients ignore the "api-version" param since we do not want to
  // add it as the first/default parameter for each of the service calls
  return !isLegacyClient(config) || parameter.prop !== 'api-version';
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

  return camelCase({
    input: `${operation.method}-${urlWithoutPlaceholders}`,
  });
};

export const operationParameterNameFn = (
  parameter: Omit<OperationParameter, 'name'>,
): string => {
  const config = getConfig();

  return !isLegacyClient(config)
    ? parameter.prop
    : transformTypeKeyName(parameter.prop);
};
