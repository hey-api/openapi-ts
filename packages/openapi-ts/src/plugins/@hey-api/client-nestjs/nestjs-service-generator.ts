import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import { typesId } from '../typescript/ref';
import type { HeyApiClientNestjsPlugin } from './types';
import {
  createClientClassName,
  createServiceClassName,
  getClientName,
} from './utils';

/**
 * Represents a group of operations for a single tag
 */
interface ServiceGroup {
  className: string;
  operations: Array<{
    method: keyof IR.PathItemObject;
    operation: IR.OperationObject;
    path: string;
  }>;
  tag: string;
}

/**
 * Groups operations by their tags
 */
export const groupOperationsByTags = (
  operations: Array<{
    method: keyof IR.PathItemObject;
    operation: IR.OperationObject;
    path: string;
  }>,
): Map<string, ServiceGroup> => {
  const groups = new Map<string, ServiceGroup>();

  for (const operationData of operations) {
    const { operation } = operationData;
    const tags =
      operation.tags && operation.tags.length > 0
        ? operation.tags
        : ['default'];

    for (const tag of tags) {
      if (!groups.has(tag)) {
        groups.set(tag, {
          className: tag,
          // Will be processed later with naming conventions
operations: [], 
          tag,
        });
      }

      groups.get(tag)!.operations.push(operationData);
    }
  }

  return groups;
};

/**
 * Generates method name for an operation in a service
 */
export const generateOperationMethodName = (
  operation: IR.OperationObject,
): string => {
  // Use operationId if available, otherwise generate from method + path
  if (operation.operationId) {
    return stringCase({
      case: 'camelCase',
      value: operation.operationId,
    });
  }

  // Fallback: generate from method and path
  const pathParts = operation.path
    .split('/')
    .filter((part) => part && !part.startsWith('{'))
    .map((part) => stringCase({ case: 'PascalCase', value: part }));

  const methodName = stringCase({ case: 'camelCase', value: operation.method });
  const pathName = pathParts.join('');

  return pathName ? `${methodName}${pathName}` : methodName;
};
/**
 * Processes service groups and applies naming conventions
 */
export const processServiceGroups = (
  groups: Map<string, ServiceGroup>,
  clientName: string,
): Map<string, ServiceGroup> => {
  const processedGroups = new Map<string, ServiceGroup>();

  for (const [tag, group] of groups) {
    const processedGroup: ServiceGroup = {
      ...group,
      className: createServiceClassName(clientName, tag),
    };
    processedGroups.set(tag, processedGroup);
  }

  return processedGroups;
};

/**
 * Main service generation function
 */
export const generateServices = ({
  plugin,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
}) => {
  const clientName = getClientName(plugin.config);
  const operations: Array<{
    method: keyof IR.PathItemObject;
    operation: IR.OperationObject;
    path: string;
  }> = [];

  // Collect all operations
  plugin.forEach('operation', ({ method, operation, path }) => {
    operations.push({ method, operation, path });
  });

  // Group operations by tags
  const serviceGroups = groupOperationsByTags(operations);
  const processedGroups = processServiceGroups(serviceGroups, clientName);

  // Generate service files using proper plugin API
  for (const [tag, group] of processedGroups) {
    generateServiceFile({ clientName, group, plugin, tag });
  }

  return processedGroups;
};

/**
 * Generates a single operation method with proper typing and implementation
 */
const generateOperationMethod = (
  operation: IR.OperationObject,
  methodName: string,
  _path: string,
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'],
) => {
  // Generate JSDoc comment
  const comments = [];
  if (operation.summary) {
    comments.push(operation.summary);
  }
  if (operation.description && operation.description !== operation.summary) {
    comments.push(operation.description);
  }
  if (operation.deprecated) {
    comments.push('@deprecated');
  }

  // Get TypeScript plugin and import types
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;

  // Get data type (request parameters)
  const dataTypeId = pluginTypeScript.api.getId({ operation, type: 'data' });
  const dataTypeName = fileTypeScript.getName(dataTypeId);

  // Get response type
  const responseTypeId = pluginTypeScript.api.getId({
    operation,
    type: 'responses',
  });
  const responseTypeName = fileTypeScript.getName(responseTypeId);

  // Create the method parameter type based on the operation
  const hasParams = hasOperationParameters(operation);

  // All methods should have at least an options parameter (optional if no required params)
  const parameters = hasParams
    ? [
        {
          name: 'options',
          type: tsc.typeReferenceNode({ typeName: dataTypeName || 'unknown' }),
        },
      ]
    : [
        {
          isOptional: true,
          name: 'options',
          type: tsc.typeReferenceNode({ typeName: dataTypeName || 'unknown' }),
        },
      ];

  // Generate method implementation - always pass true since we always have an options parameter now
  const methodCall = generateMethodImplementation(operation, true);

  // Create return type - get 200 response or fallback to any response
  const returnType = tsc.typeReferenceNode({
    typeArguments: [
      tsc.typeReferenceNode({
        typeArguments: [
          // Use the proper response type from TypeScript plugin
          responseTypeName
            ? tsc.indexedAccessTypeNode({
                indexType: tsc.literalTypeNode({
                  literal: tsc.ots.number(200),
                }),
                objectType: tsc.typeReferenceNode({
                  typeName: responseTypeName,
                }),
              })
            : tsc.keywordTypeNode({ keyword: 'unknown' }),
        ],
        typeName: 'AxiosResponse',
      }),
    ],
    typeName: 'Promise',
  });

  return tsc.methodDeclaration({
    accessLevel: 'public',
    comment: comments.length > 0 ? comments : undefined,
    isAsync: true,
    name: methodName,
    parameters,
    returnType,
    statements: [methodCall],
  });
};

/**
 * Checks if an operation has parameters
 */
const hasOperationParameters = (operation: IR.OperationObject): boolean => {
  const hasPath =
    operation.parameters?.path &&
    Object.keys(operation.parameters.path).length > 0;
  const hasQuery =
    operation.parameters?.query &&
    Object.keys(operation.parameters.query).length > 0;
  const hasHeader =
    operation.parameters?.header &&
    Object.keys(operation.parameters.header).length > 0;
  const hasBody = !!operation.body;

  return hasPath || hasQuery || hasHeader || hasBody;
};

/**
 * Generates the method implementation that calls the client
 */
const generateMethodImplementation = (
  operation: IR.OperationObject,
  hasParams: boolean,
) => {
  const methodName = operation.method.toLowerCase();

  // Methods that require data (POST, PUT, PATCH)
  const methodsWithData = ['post', 'put', 'patch'];
  const hasData = methodsWithData.includes(methodName);

  if (hasData) {
    // For methods with data: post(url, data, options)
    return tsc.returnStatement({
      expression: tsc.awaitExpression({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: tsc.this(),
              name: 'client',
            }),
            name: methodName,
          }),
          parameters: [
            // URL parameter - either from options or default path
            hasParams
              ? tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: 'url',
                })
              : tsc.stringLiteral({ text: operation.path }),
            // Data parameter - either from options.body or undefined
            hasParams
              ? tsc.conditionalExpression({
                  condition: tsc.binaryExpression({
                    left: tsc.stringLiteral({ text: 'body' }),
                    operator: 'in',
                    right: tsc.identifier({ text: 'options' }),
                  }),
                  whenFalse: tsc.identifier({ text: 'undefined' }),
                  whenTrue: tsc.propertyAccessExpression({
                    expression: tsc.identifier({ text: 'options' }),
                    name: 'body',
                  }),
                })
              : tsc.identifier({ text: 'undefined' }),
            // Options parameter - spread options but exclude url and body
            hasParams
              ? tsc.objectExpression({
                  obj: [
                    {
                      spread: tsc.identifier({ text: 'options' }),
                    },
                  ],
                })
              : tsc.objectExpression({ obj: [] }),
          ],
        }),
      }),
    });
  } else {
    // For methods without data: get(url, options), delete(url, options)
    return tsc.returnStatement({
      expression: tsc.awaitExpression({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: tsc.this(),
              name: 'client',
            }),
            name: methodName,
          }),
          parameters: [
            // URL parameter - either from options or default path
            hasParams
              ? tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: 'url',
                })
              : tsc.stringLiteral({ text: operation.path }),
            // Options parameter - spread options but exclude url
            hasParams
              ? tsc.objectExpression({
                  obj: [
                    {
                      spread: tsc.identifier({ text: 'options' }),
                    },
                  ],
                })
              : tsc.objectExpression({ obj: [] }),
          ],
        }),
      }),
    });
  }
};

/**
 * Generates a single service file using the TypeScript Compiler API
 */
const generateServiceFile = ({
  clientName,
  group,
  plugin,
  tag,
}: {
  clientName: string;
  group: ServiceGroup;
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
  tag: string;
}) => {
  const clientClassName = createClientClassName(clientName);

  // Create service file
  const file = plugin.createFile({
    id: `service-${tag}`,
    path: `${plugin.output}/services/${clientName.toLowerCase()}-${tag.toLowerCase()}.service`,
  });

  // Add imports
  const nestjsImport = tsc.namedImportDeclarations({
    imports: ['Injectable'],
    module: '@nestjs/common',
  });
  file.add(nestjsImport);

  const axiosImport = tsc.namedImportDeclarations({
    imports: [{ asType: true, name: 'AxiosResponse' }],
    module: 'axios',
  });
  file.add(axiosImport);

  const clientImport = tsc.namedImportDeclarations({
    imports: [clientClassName],
    module: `../${clientName.toLowerCase()}-client.service.gen`,
  });
  file.add(clientImport);

  // Import operation-specific types from TypeScript plugin
  const pluginTypeScript = plugin.getPlugin('@hey-api/typescript')!;
  const fileTypeScript = plugin.context.file({ id: typesId })!;
  const typesToImport = new Set<string>();

  // Collect all unique type names for this service
  for (const { operation } of group.operations) {
    const dataTypeId = pluginTypeScript.api.getId({ operation, type: 'data' });
    const dataTypeName = fileTypeScript.getName(dataTypeId);
    if (dataTypeName) {
      typesToImport.add(dataTypeName);
    }

    const responseTypeId = pluginTypeScript.api.getId({
      operation,
      type: 'responses',
    });
    const responseTypeName = fileTypeScript.getName(responseTypeId);
    if (responseTypeName) {
      typesToImport.add(responseTypeName);
    }
  }

  // Import all the types at once
  if (typesToImport.size > 0) {
    const operationTypesImport = tsc.namedImportDeclarations({
      imports: Array.from(typesToImport).map((name) => ({
        asType: true,
        name,
      })),
      module: file.relativePathToFile({ context: plugin.context, id: typesId }),
    });
    file.add(operationTypesImport);
  }

  // Create constructor
  const constructor = tsc.constructorDeclaration({
    parameters: [
      {
        accessLevel: 'private',
        isReadOnly: true,
        name: 'client',
        type: tsc.typeReferenceNode({ typeName: clientClassName }),
      },
    ],
    statements: [],
  });

  // Create service methods for each operation
  const methods: Array<any> = [constructor];

  for (const { operation, path } of group.operations) {
    const methodName = generateOperationMethodName(operation);
    const method = generateOperationMethod(operation, methodName, path, plugin);
    methods.push(method);
  }

  // Create the service class
  const serviceClass = tsc.classDeclaration({
    decorator: {
      args: [],
      name: 'Injectable',
    },
    exportClass: true,
    name: group.className,
    nodes: methods,
  });

  file.add(serviceClass);
};
