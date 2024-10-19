import type { Config } from '../types/config';
import { camelCase } from '../utils/camelCase';
import { getConfig, isLegacyClient } from '../utils/config';
import { transformTypeKeyName } from '../utils/type';
import type { OperationParameter } from './common/interfaces/client';
import { sanitizeNamespaceIdentifier } from './common/parser/sanitize';

export interface ParserConfig {
  debug?: boolean;
  filterFn: {
    operation: typeof operationFilterFn;
    operationParameter: typeof operationParameterFilterFn;
  };
  nameFn: {
    operation: typeof operationNameFn;
    operationParameter: typeof operationParameterNameFn;
  };
}

let _config: ParserConfig;

export const getParserConfig = () => _config;

export const setParserConfig = (config: ParserConfig) => {
  _config = config;
  return getParserConfig();
};

export const operationFilterFn = ({
  config,
  operationKey,
}: {
  config: Config;
  operationKey: string;
}): boolean => {
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
  if (config.services.operationId && operationId) {
    return camelCase({
      input: sanitizeNamespaceIdentifier(operationId),
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

  return camelCase({
    input: `${method}-${urlWithoutPlaceholders}`,
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
