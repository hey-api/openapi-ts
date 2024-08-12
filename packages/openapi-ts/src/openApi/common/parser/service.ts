import { camelCase } from '../../../utils/camelCase';
import type { Operation, Service } from '../interfaces/client';
import { sanitizeNamespaceIdentifier } from './sanitize';

export const allowedServiceMethods = [
  'connect',
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
] as const;

export const getNewService = (operation: Operation): Service => ({
  $refs: [],
  imports: [],
  name: operation.service,
  operations: [],
});

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
export function getServiceVersion(version = '1.0'): string {
  return String(version).replace(/^v/gi, '');
}

/**
 * Convert the input value to a correct service name. This converts
 * the input string to PascalCase.
 */
export const getServiceName = (value: string): string =>
  camelCase({
    input: sanitizeNamespaceIdentifier(value),
    pascalCase: true,
  });
