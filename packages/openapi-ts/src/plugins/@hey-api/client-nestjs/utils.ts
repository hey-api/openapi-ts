import { stringCase } from '../../../utils/stringCase';

/**
 * Utility function for generating unique injection tokens
 */
export const createClientConfigToken = (clientName: string): string => {
  const tokenName = stringCase({
    case: 'SCREAMING_SNAKE_CASE',
    value: `${clientName}_CLIENT_CONFIG`,
  });
  return tokenName;
};

/**
 * Utility functions for consistent naming
 */
export const createClientClassName = (clientName: string): string =>
  `${stringCase({ case: 'PascalCase', value: clientName })}Client`;

export const createServiceClassName = (
  clientName: string,
  tag: string,
): string => {
  const pascalClientName = stringCase({
    case: 'PascalCase',
    value: clientName,
  });
  const pascalTag = stringCase({ case: 'PascalCase', value: tag });
  return `${pascalClientName}${pascalTag}Service`;
};

export const createModuleClassName = (clientName: string): string => {
  const pascalClientName = stringCase({
    case: 'PascalCase',
    value: clientName,
  });
  return `${pascalClientName}Module`;
};

/**
 * Utility for service file names
 */
export const createServiceFileName = (
  clientName: string,
  tag: string,
): string => {
  // Convert to snake_case and then replace underscores with hyphens for kebab-case
  const kebabClientName = stringCase({
    case: 'snake_case',
    value: clientName,
  }).replace(/_/g, '-');
  const kebabTag = stringCase({ case: 'snake_case', value: tag }).replace(
    /_/g,
    '-',
  );
  return `${kebabClientName}-${kebabTag}.service.ts`;
};

/**
 * Utility for module file names
 */
export const createModuleFileName = (clientName: string): string => {
  // Convert to snake_case and then replace underscores with hyphens for kebab-case
  const kebabClientName = stringCase({
    case: 'snake_case',
    value: clientName,
  }).replace(/_/g, '-');
  return `${kebabClientName}.module.ts`;
};

/**
 * Get the client name from plugin config with fallback
 */
export const getClientName = (config: { clientName?: string }): string =>
  config.clientName || 'Api';
