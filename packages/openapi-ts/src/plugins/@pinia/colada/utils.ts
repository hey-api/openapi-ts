import type { TypeNode } from 'typescript';

import type { GeneratedFile } from '../../../generate/file';
import type { IR } from '../../../ir/types';
import type { Property} from '../../../tsc';
import { tsc } from '../../../tsc';
import { escapeComment } from '../../../utils/escape';
import { stringCase } from '../../../utils/stringCase';
import { irParametersToIrSchema } from '../../@hey-api/typescript/operation';
import {
  schemaToType,
} from '../../@hey-api/typescript/plugin';
import {
  importIdentifierData,
  importIdentifierError,
  importIdentifierResponse,
} from '../../@hey-api/typescript/ref';
import type { PiniaColadaPlugin } from './types';

/**
 * Determines if an operation should be a query or mutation
 */
export const isQuery = (
  operation: IR.OperationObject,
  plugin: PiniaColadaPlugin['Instance'],
): boolean => {
  // 1. Check for hook override
  const hookResult = plugin.config.resolveQuery?.(operation);
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
  plugin: PiniaColadaPlugin['Instance'],
) => {
  const obj: Array<{
    key: string;
    value: any;
  }> = [];

  // Use default stale time if specified in config
  if (plugin.config.defaultStaleTime !== undefined) {
    obj.push({
      key: 'staleTime',
      value: plugin.config.defaultStaleTime,
    });
  }

  // Use default cache time if specified in config
  if (plugin.config.defaultCacheTime !== undefined) {
    obj.push({
      key: 'gcTime',
      value: plugin.config.defaultCacheTime,
    });
  }

  // Add pagination config if enabled and operation has pagination parameters
  if (
    plugin.config.enablePaginationOnKey &&
    hasPagination(operation, plugin.config.enablePaginationOnKey)
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

const parametersPluralizedNames = [
  'query',
  'path',
  'headers',
  'body',
  'cookies',
] as const;
type ParamNames = (typeof parametersPluralizedNames)[number];
// Define a conditional type to transform the names
type NonPluralizedName<T extends ParamNames> = T extends 'headers'
  ? 'header'
  : T extends 'cookies'
    ? 'cookie'
    : T;
function getNonPluralizedName<T extends ParamNames>(
  name: T,
): NonPluralizedName<T> {
  return (
    ['headers', 'cookies'].includes(name) ? name.slice(0, -1) : name
  ) as NonPluralizedName<T>;
}
type DataKeyNames = Exclude<ParamNames, 'cookies'>;
function getDataSubType(identifier: string, dataKey: DataKeyNames) {
  return tsc.indexedAccessTypeNode({
    indexType: tsc.literalTypeNode({
      literal: tsc.stringLiteral({
        text: dataKey,
      }),
    }),
    objectType: tsc.typeReferenceNode({
      typeName: identifier,
    }),
  });
}

function createParameterConst(
  name: ParamNames,
  operation?: IR.OperationObject,
) {
  const nonPluralizedName = getNonPluralizedName(name);
  if (nonPluralizedName === 'body' && !operation?.body?.schema) return [];
  if (
    nonPluralizedName !== 'body' &&
    !operation?.parameters?.[nonPluralizedName]
  )
    return [];
  return [
    tsc.constVariable({
      expression: tsc.callExpression({
        functionName: 'toRef',
        parameters: [getParameterQualifiedName(name)],
      }),
      name: `${name}Ref`,
    }),
  ];
}
function getParameterQualifiedName(name: ParamNames) {
  return tsc.propertyAccessExpression({
    expression: 'params',
    isOptional: true,
    name,
  });
}
/**
 * Creates a composable function for an operation
 */
export const createComposable = ({
  context,
  file,
  isQuery,
  operation,
  plugin,
}: {
  context: IR.Context;
  file: GeneratedFile;
  isQuery: boolean;
  operation: IR.OperationObject;
  plugin: PiniaColadaPlugin['Instance'];
}) => {
  // Import necessary functions and types
  file.import({
    module: '@pinia/colada',
    name: isQuery ? 'useQuery' : 'useMutation',
  });
  file.import({
    asType: true,
    module: '@pinia/colada',
    name: `Use${isQuery ? 'Query' : 'Mutation'}Options`,
  });
  file.import({
    module: 'vue',
    name: 'toRef',
  });

  // Get query key from hooks or generate default
  const queryKey = plugin.config.resolveQueryKey?.(operation) ?? [
    operation.tags?.[0] || 'default',
    operation.id,
  ];

  // Get identifiers for data, response and error types
  const identifierData = importIdentifierData({ context, file, operation });
  const identifierResponse = importIdentifierResponse({
    context,
    file,
    operation,
  });
  const identifierError = importIdentifierError({ context, file, operation });

  /**
   * Creates a parameter for a composable function
   */
  function createParameter(
    name: ParamNames,
    operation?: IR.OperationObject,
  ): Array<Property> {
    const nonPluralizedName = getNonPluralizedName(name);
    if (nonPluralizedName === 'body' && !operation?.body?.schema) return [];
    if (
      nonPluralizedName !== 'body' &&
      !operation?.parameters?.[nonPluralizedName]
    )
      return [];
    let type: TypeNode = tsc.keywordTypeNode({ keyword: 'unknown' });
    if (nonPluralizedName === 'cookie') {
      type =
        schemaToType({
          onRef: undefined,
          plugin: plugin as any,
          schema: irParametersToIrSchema({
            parameters: operation?.parameters?.cookie || {},
          }),
          state: {
            usedTypeIDs: new Set(),
          },
        }) ?? type;
    } else if (name !== 'cookies') {
      type = identifierData.name
        ? getDataSubType(identifierData.name, name)
        : type;
    }
    return [
      {
        name,
        type,
      },
    ];
  }
  const parameters = parametersPluralizedNames.flatMap((name) =>
    createParameter(name, operation),
  );

  // Create the composable function
  const node = tsc.constVariable({
    comment: [
      operation.deprecated && '@deprecated',
      operation.summary && escapeComment(operation.summary),
      operation.description && escapeComment(operation.description),
    ].filter(Boolean),
    exportConst: true,
    expression: tsc.arrowFunction({
      async: true,
      parameters: [
        {
          isRequired: parameters.length > 0,
          name: 'params',
          type: tsc.typeInterfaceNode({
            properties: parameters,
            useLegacyResolution: true,
          }),
        },
        // Additional Pinia Colada options
        {
          isRequired: false,
          name: 'options',
          type: tsc.typeReferenceNode({
            typeName: isQuery
              ? `UseQueryOptions<${identifierResponse.name || 'unknown'}, ${identifierError.name || 'unknown'}, ${identifierData.name || 'unknown'}>`
              : `UseMutationOptions<${identifierResponse.name || 'unknown'}, ${identifierData.name || 'unknown'}, ${identifierError.name || 'unknown'}>`,
          }),
        },
      ],
      statements: [
        // Create reactive refs for parameters
        ...parametersPluralizedNames.flatMap((name) =>
          createParameterConst(name, operation),
        ),

        // Create query/mutation result
        tsc.constVariable({
          expression: tsc.callExpression({
            functionName: isQuery ? 'useQuery' : 'useMutation',
            parameters: [
              tsc.objectExpression({
                obj: [
                  // Query/mutation function
                  {
                    key: isQuery ? 'query' : 'mutation',
                    value: tsc.callExpression({
                      functionName: '_heyApiClient',
                      parameters: [
                        tsc.objectExpression({
                          obj: [
                            {
                              key: 'method',
                              value: operation.method,
                            },
                            {
                              key: 'url',
                              value: operation.path,
                            },
                            // Add data if it's a valid body parameter (mutations only)
                            ...parametersPluralizedNames.flatMap((name) => {
                              const nonPluralizedName =
                                getNonPluralizedName(name);
                              if (
                                nonPluralizedName === 'body' &&
                                !operation?.body?.schema
                              )
                                return [];
                              if (
                                nonPluralizedName !== 'body' &&
                                !operation?.parameters?.[nonPluralizedName]
                              )
                                return [];
                              return [
                                {
                                  key:
                                    nonPluralizedName === 'body'
                                      ? 'data'
                                      : name,
                                  value: tsc.identifier({ text: `${name}Ref` }),
                                },
                              ];
                            }),
                          ].filter(Boolean),
                        }),
                      ],
                    }),
                  },
                  // Query key (optional for mutations)
                  {
                    key: 'key',
                    value: tsc.arrayLiteralExpression({
                      elements: [
                        ...queryKey.map((k: string) => tsc.ots.string(k)),
                        // Add path params to query key if they exist
                        ...parametersPluralizedNames.flatMap((name) => {
                          const nonPluralizedName = getNonPluralizedName(name);
                          if (
                            nonPluralizedName === 'body' &&
                            !operation?.body?.schema
                          )
                            return [];
                          if (
                            nonPluralizedName !== 'body' &&
                            !operation?.parameters?.[nonPluralizedName]
                          )
                            return [];
                          return [tsc.identifier({ text: `${name}Ref` })];
                        }),
                      ],
                    }),
                  },
                  // Spread additional options
                  {
                    spread: 'options',
                  },
                ],
              }),
            ],
          }),
          name: isQuery ? 'queryResult' : 'mutationResult',
        }),

        // Return useQuery/useMutation call with reactive parameters
        tsc.returnStatement({
          expression: tsc.objectExpression({
            obj: [
              // Spread the query/mutation result
              {
                spread: isQuery ? 'queryResult' : 'mutationResult',
              },
              // Return reactive parameters
              ...parametersPluralizedNames.flatMap((name) => {
                const nonPluralizedName = getNonPluralizedName(name);
                if (nonPluralizedName === 'body' && !operation?.body?.schema)
                  return [];
                if (
                  nonPluralizedName !== 'body' &&
                  !operation?.parameters?.[nonPluralizedName]
                )
                  return [];
                return [
                  {
                    key: name,
                    value: tsc.identifier({ text: `${name}Ref` }),
                  },
                ];
              }),
            ],
          }),
        }),
      ],
    }),
    name: generateFunctionName(
      operation,
      isQuery,
      plugin.config.prefixUse,
      plugin.config.suffixQueryMutation,
    ),
  });

  file.add(node);
};
