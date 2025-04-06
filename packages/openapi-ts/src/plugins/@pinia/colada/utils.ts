import type ts from 'typescript';

import { compiler } from '../../../compiler';
import type { IR } from '../../../ir/types';
import { stringCase } from '../../../utils/stringCase';
import { schemaToType } from '../../@hey-api/typescript/plugin';
import type { Plugin } from '../../types';
import type { Config } from './types';

/**
 * Creates parameter types from operation parameters
 */
export const createParamTypes = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}) => {
  const paramTypes: Array<{
    initialValue?: string;
    key: string;
    required: boolean;
    type: ts.TypeNode;
  }> = [];

  // Path parameters
  if (operation.parameters?.path) {
    const pathParams = Object.entries(operation.parameters.path).map(
      ([name, param]) => ({
        key: name,
        required: param.required ?? false,
        type: schemaToType({
          context,
          plugin: plugin as any, // Type assertion to work around type mismatch
          schema: param.schema,
        }),
      }),
    );
    if (pathParams.length > 0) {
      paramTypes.push({
        key: 'path',
        required: pathParams.some((p) => p.required),
        type: compiler.typeInterfaceNode({
          properties: pathParams.map(({ key, required, type }) => ({
            isRequired: required,
            name: key,
            type,
          })),
          useLegacyResolution: false,
        }),
      });
    }
  }

  // Query parameters
  if (operation.parameters?.query) {
    const queryParams = Object.entries(operation.parameters.query).map(
      ([name, param]) => ({
        key: name,
        required: param.required ?? false,
        type: schemaToType({
          context,
          plugin: plugin as any, // Type assertion to work around type mismatch
          schema: param.schema,
        }),
      }),
    );
    if (queryParams.length > 0) {
      paramTypes.push({
        key: 'query',
        required: queryParams.some((p) => p.required),
        type: compiler.typeInterfaceNode({
          properties: queryParams.map(({ key, required, type }) => ({
            isRequired: required,
            name: key,
            type,
          })),
          useLegacyResolution: false,
        }),
      });
    }
  }

  // Header parameters
  if (operation.parameters?.header) {
    const headerParams = Object.entries(operation.parameters.header).map(
      ([name, param]) => ({
        key: name,
        required: param.required ?? false,
        type: schemaToType({
          context,
          plugin: plugin as any, // Type assertion to work around type mismatch
          schema: param.schema,
        }),
      }),
    );
    if (headerParams.length > 0) {
      paramTypes.push({
        key: 'headers',
        required: headerParams.some((p) => p.required),
        type: compiler.typeInterfaceNode({
          properties: headerParams.map(({ key, required, type }) => ({
            isRequired: required,
            name: key,
            type,
          })),
          useLegacyResolution: false,
        }),
      });
    }
  }

  // Cookie parameters
  if (operation.parameters?.cookie) {
    const cookieParams = Object.entries(operation.parameters.cookie).map(
      ([name, param]) => ({
        key: name,
        required: param.required ?? false,
        type: schemaToType({
          context,
          plugin: plugin as any, // Type assertion to work around type mismatch
          schema: param.schema,
        }),
      }),
    );
    if (cookieParams.length > 0) {
      paramTypes.push({
        key: 'cookies',
        required: cookieParams.some((p) => p.required),
        type: compiler.typeInterfaceNode({
          properties: cookieParams.map(({ key, required, type }) => ({
            isRequired: required,
            name: key,
            type,
          })),
          useLegacyResolution: false,
        }),
      });
    }
  }

  return paramTypes;
};

/**
 * Determines if an operation should be a query or mutation
 */
export const isQuery = (
  operation: IR.OperationObject,
  plugin: Plugin.Instance<Config>,
): boolean => {
  // 1. Check for hook override
  const hookResult = plugin?.resolveQuery?.(operation);
  if (hookResult !== undefined) {
    return hookResult;
  }

  // 2. Use method as primary signal
  if (['get', 'head', 'options'].includes(operation.method)) {
    return true;
  }

  // 3. Consider body presence as secondary signal
  // If method is not GET/HEAD/OPTIONS but also has no body schema, likely a query
  return !operation.body?.schema;
};

/**
 * Generates the cache configuration object for a query
 */
export const generateCacheConfig = (
  operation: IR.OperationObject,
  plugin: Plugin.Instance<Config>,
) => {
  const obj: Array<{
    key: string;
    value: any;
  }> = [];

  // Use default stale time if specified in config
  if (plugin.defaultStaleTime !== undefined) {
    obj.push({
      key: 'staleTime',
      value: plugin.defaultStaleTime,
    });
  }

  // Use default cache time if specified in config
  if (plugin.defaultCacheTime !== undefined) {
    obj.push({
      key: 'gcTime',
      value: plugin.defaultCacheTime,
    });
  }

  // Add pagination config if enabled and operation has pagination parameters
  if (
    plugin.enablePaginationOnKey &&
    hasPagination(operation, plugin.enablePaginationOnKey)
  ) {
    obj.push({
      key: 'infinite',
      value: true,
    });
  }

  return obj;
};

/**
 * Checks if operation has pagination parameters
 */
export const hasPagination = (
  operation: IR.OperationObject,
  paginationParam: string,
): boolean =>
  // Check if operation has pagination parameter
  !!operation.parameters?.query?.[paginationParam] ||
  !!operation.body?.pagination;

/**
 * Generates the function name for an operation
 */
export const generateFunctionName = (
  operation: IR.OperationObject,
  isQueryType: boolean,
  prefixUse: boolean = true,
  suffixQueryMutation: boolean = true,
): string => {
  const operationPascalCase = stringCase({
    case: 'PascalCase',
    value: operation.id,
  });
  const prefix = prefixUse ? 'use' : '';
  const suffix = suffixQueryMutation
    ? isQueryType
      ? 'Query'
      : 'Mutation'
    : '';
  return `${prefix}${operationPascalCase}${suffix}`;
};
