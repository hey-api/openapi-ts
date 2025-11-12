import ts from 'typescript';

import type { IR } from '../../../ir/types';
import { tsc } from '../../../tsc';
import { stringCase } from '../../../utils/stringCase';
import type { HeyApiClientNestjsPlugin } from './types';
import {
  createClientClassName,
  createClientConfigToken,
  createModuleClassName,
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
 * Main generation orchestrator - generates all NestJS client artifacts
 */
export const generateNestjsClient = ({
  plugin,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
}) => {
  const clientName = getClientName(plugin.config);

  // Step 1: Collect and group operations first
  const operations: Array<{
    method: keyof IR.PathItemObject;
    operation: IR.OperationObject;
    path: string;
  }> = [];

  plugin.forEach('operation', ({ method, operation, path }) => {
    operations.push({ method, operation, path });
  });

  // Step 2: Group operations by tags and deduplicate class names
  const serviceGroups = groupOperationsByTags(operations);
  const processedGroups = processServiceGroups(serviceGroups, clientName);

  // Step 3: Generate everything into a single file
  generateSingleFile({
    clientName,
    plugin,
    serviceGroups: processedGroups,
  });
};

/**
 * Generates everything into a single file in the correct order:
 * 1. Imports
 * 2. API Client Service Class
 * 3. Services by Tags Classes
 * 4. Module Class
 */
const generateSingleFile = ({
  clientName,
  plugin,
  serviceGroups,
}: {
  clientName: string;
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
  serviceGroups: Map<string, ServiceGroup>;
}) => {
  const clientClassName =
    plugin.config.clientClassName || createClientClassName(clientName);
  const moduleClassName =
    plugin.config.moduleName || createModuleClassName(clientName);
  const configToken = createClientConfigToken(clientName);

  // Register single symbol for the entire client file
  const clientSymbol = plugin.registerSymbol({
    exported: true,
    name: clientClassName,
  });

  // Collect all operation-specific types
  const typesToImport = new Set<string>();

  for (const group of serviceGroups.values()) {
    for (const { operation } of group.operations) {
      const dataSymbol = plugin.querySymbol({
        category: 'type',
        resource: 'operation',
        resourceId: operation.id,
        role: 'data',
        tool: 'typescript',
      });
      if (dataSymbol?.placeholder) {
        typesToImport.add(dataSymbol.placeholder);
      }

      const responseSymbol = plugin.querySymbol({
        category: 'type',
        resource: 'operation',
        resourceId: operation.id,
        role: 'responses',
      });
      if (responseSymbol?.placeholder) {
        typesToImport.add(responseSymbol.placeholder);
      }
    }
  }

  // Get unique service class names
  const uniqueServiceClassNames = Array.from(
    new Set(Array.from(serviceGroups.values()).map((group) => group.className)),
  );

  // === SECTION 1: IMPORTS ===
  const imports = [
    // NestJS imports
    tsc.namedImportDeclarations({
      imports: ['Injectable', 'Inject', 'Module', 'DynamicModule'],
      module: '@nestjs/common',
    }),

    // Axios default import
    tsc.defaultImportDeclaration({
      module: 'axios',
      name: 'axios',
    }),

    // Axios type imports
    tsc.namedImportDeclarations({
      imports: [
        { asType: true, name: 'AxiosInstance' },
        { asType: true, name: 'AxiosRequestConfig' },
        { asType: true, name: 'AxiosResponse' },
        { asType: true, name: 'RawAxiosRequestHeaders' },
      ],
      module: 'axios',
    }),

    // Client types imports
    tsc.namedImportDeclarations({
      imports: [
        { asType: true, name: 'ClientModuleConfig' },
        { asType: true, name: 'ClientModuleAsyncConfig' },
        { asType: true, name: 'RequestOptions' },
      ],
      module: './types.gen',
    }),

    // Operation-specific types import
    ...(typesToImport.size > 0
      ? [
          tsc.namedImportDeclarations({
            imports: Array.from(typesToImport).map((name) => ({
              asType: true,
              name,
            })),
            module: './types.gen',
          }),
        ]
      : []),
  ];

  // === SECTION 2: API CLIENT SERVICE CLASS ===
  const clientClass = tsc.classDeclaration({
    decorator: {
      args: [],
      name: 'Injectable',
    },
    exportClass: true,
    name: clientClassName,
    nodes: [
      // Private axios instance property
      tsc.propertyDeclaration({
        modifiers: ['private'],
        name: 'axiosInstance',
        type: tsc.typeReferenceNode({ typeName: 'AxiosInstance' }),
      }),

      // Constructor with dependency injection
      createClientConstructor(configToken),

      // Generic request method
      createRequestMethod(),

      // HTTP method shortcuts
      createGetMethod(),
      createPostMethod(),
      createPutMethod(),
      createPatchMethod(),
      createDeleteMethod(),
      createHeadMethod(),
      createOptionsMethod(),
    ],
  });

  // === SECTION 3: SERVICES BY TAGS CLASSES ===
  const serviceClasses: Array<any> = [];

  for (const [_tag, group] of serviceGroups) {
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
      const method = generateOperationMethod(
        operation,
        methodName,
        path,
        plugin,
      );
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

    serviceClasses.push(serviceClass);
  }

  // === SECTION 4: MODULE CLASS ===
  const allServices = [clientClassName, ...uniqueServiceClassNames];

  // Create the forRoot static method
  const forRootMethod = tsc.methodDeclaration({
    accessLevel: 'public',
    isStatic: true,
    name: 'forRoot',
    parameters: [
      {
        name: 'config',
        type: tsc.typeReferenceNode({ typeName: 'ClientModuleConfig' }),
      },
    ],
    returnType: tsc.typeReferenceNode({ typeName: 'DynamicModule' }),
    statements: [
      tsc.returnStatement({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'module',
              value: tsc.identifier({ text: moduleClassName }),
            },
            {
              key: 'providers',
              value: tsc.arrayLiteralExpression({
                elements: [
                  // Config provider
                  tsc.objectExpression({
                    obj: [
                      {
                        key: 'provide',
                        value: tsc.stringLiteral({ text: configToken }),
                      },
                      {
                        key: 'useValue',
                        value: tsc.identifier({ text: 'config' }),
                      },
                    ],
                  }),
                  // All service providers
                  ...allServices.map((serviceName) =>
                    tsc.identifier({ text: serviceName }),
                  ),
                ],
              }),
            },
            {
              key: 'exports',
              value: tsc.arrayLiteralExpression({
                elements: allServices.map((serviceName) =>
                  tsc.identifier({ text: serviceName }),
                ),
              }),
            },
          ],
        }),
      }),
    ],
  });

  // Create the forRootAsync static method
  const forRootAsyncMethod = tsc.methodDeclaration({
    accessLevel: 'public',
    isStatic: true,
    name: 'forRootAsync',
    parameters: [
      {
        name: 'options',
        type: tsc.typeReferenceNode({ typeName: 'ClientModuleAsyncConfig' }),
      },
    ],
    returnType: tsc.typeReferenceNode({ typeName: 'DynamicModule' }),
    statements: [
      tsc.returnStatement({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'module',
              value: tsc.identifier({ text: moduleClassName }),
            },
            {
              key: 'imports',
              value: tsc.conditionalExpression({
                condition: tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: tsc.identifier({ text: 'imports' }),
                }),
                whenFalse: tsc.arrayLiteralExpression({ elements: [] }),
                whenTrue: tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: tsc.identifier({ text: 'imports' }),
                }),
              }),
            },
            {
              key: 'providers',
              value: tsc.arrayLiteralExpression({
                elements: [
                  // Async config provider
                  tsc.objectExpression({
                    obj: [
                      {
                        key: 'provide',
                        value: tsc.stringLiteral({ text: configToken }),
                      },
                      {
                        key: 'useFactory',
                        value: tsc.conditionalExpression({
                          condition: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'useFactory' }),
                          }),
                          whenFalse: tsc.arrowFunction({
                            parameters: [],
                            returnType: 'ClientModuleConfig',
                            statements: [
                              tsc.returnStatement({
                                expression: tsc.objectExpression({ obj: [] }),
                              }),
                            ],
                          }),
                          whenTrue: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'useFactory' }),
                          }),
                        }),
                      },
                      {
                        key: 'inject',
                        value: tsc.conditionalExpression({
                          condition: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'inject' }),
                          }),
                          whenFalse: tsc.arrayLiteralExpression({
                            elements: [],
                          }),
                          whenTrue: tsc.propertyAccessExpression({
                            expression: tsc.identifier({ text: 'options' }),
                            name: tsc.identifier({ text: 'inject' }),
                          }),
                        }),
                      },
                    ],
                  }),
                  // All service providers
                  ...allServices.map((serviceName) =>
                    tsc.identifier({ text: serviceName }),
                  ),
                ],
              }),
            },
            {
              key: 'exports',
              value: tsc.arrayLiteralExpression({
                elements: allServices.map((serviceName) =>
                  tsc.identifier({ text: serviceName }),
                ),
              }),
            },
          ],
        }),
      }),
    ],
  });

  const moduleClass = tsc.classDeclaration({
    decorator: {
      args: [{}],
      name: 'Module',
    },
    exportClass: true,
    name: moduleClassName,
    nodes: [forRootMethod, forRootAsyncMethod],
  });

  // Combine everything in the correct order
  const allStatements = [
    ...imports,
    clientClass,
    ...serviceClasses,
    moduleClass,
  ];

  // Set the symbol value with all statements
  plugin.setSymbolValue(clientSymbol, allStatements);
};

/**
 * Creates the client constructor
 */
const createClientConstructor = (configToken: string) => {
  return tsc.constructorDeclaration({
    parameters: [
      {
        accessLevel: 'private',
        decorators: [
          {
            args: [configToken],
            name: 'Inject',
          },
        ],
        isReadOnly: true,
        name: 'config',
        type: tsc.typeReferenceNode({ typeName: 'ClientModuleConfig' }),
      },
    ],
    statements: [
      // Create axios configuration
      tsc.constVariable({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'baseURL',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'config' }),
                name: tsc.identifier({ text: 'baseUrl' }),
              }),
            },
            {
              key: 'headers',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'config' }),
                name: tsc.identifier({ text: 'headers' }),
              }),
            },
            {
              key: 'timeout',
              value: tsc.ots.number(5000),
            },
            {
              spread: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'config' }),
                name: tsc.identifier({ text: 'axiosConfig' }),
              }),
            },
          ],
        }),
        name: 'axiosConfig',
      }),

      // Initialize axios instance
      tsc.expressionToStatement({
        expression: tsc.binaryExpression({
          left: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'axiosInstance' }),
          }),
          operator: '=',
          right: tsc.callExpression({
            functionName: 'axios.create',
            parameters: [tsc.identifier({ text: 'axiosConfig' })],
          }),
        }),
      }),
    ],
  });
};

/**
 * Creates the generic request method
 */
const createRequestMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'request',
    parameters: [
      {
        name: 'options',
        type: tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      // Prepare axios request config
      tsc.constVariable({
        expression: tsc.objectExpression({
          obj: [
            {
              key: 'method',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'options' }),
                name: tsc.identifier({ text: 'method' }),
              }),
            },
            {
              key: 'url',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'options' }),
                name: tsc.identifier({ text: 'url' }),
              }),
            },
            {
              key: 'headers',
              value: tsc.asExpression({
                expression: tsc.propertyAccessExpression({
                  expression: tsc.identifier({ text: 'options' }),
                  name: tsc.identifier({ text: 'headers' }),
                }),
                type: tsc.typeReferenceNode({
                  typeName: 'RawAxiosRequestHeaders',
                }),
              }),
            },
            {
              key: 'params',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'options' }),
                name: tsc.identifier({ text: 'query' }),
              }),
            },
            {
              key: 'data',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'options' }),
                name: tsc.identifier({ text: 'body' }),
              }),
            },
            {
              key: 'timeout',
              value: tsc.propertyAccessExpression({
                expression: tsc.identifier({ text: 'options' }),
                name: tsc.identifier({ text: 'timeout' }),
              }),
            },
          ],
        }),
        name: 'config',
        typeName: 'AxiosRequestConfig',
      }),

      // Make the request
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'axiosInstance' }),
          }),
          parameters: [tsc.identifier({ text: 'config' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

/**
 * Creates HTTP method shortcuts (GET, POST, etc.)
 */
const createGetMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'get',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'GET' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createPostMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'post',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'data',
        type: tsc.typeReferenceNode({ typeName: 'any' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'body' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'POST' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  key: 'body',
                  value: tsc.identifier({ text: 'data' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createPutMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'put',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'data',
        type: tsc.typeReferenceNode({ typeName: 'any' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'body' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'PUT' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  key: 'body',
                  value: tsc.identifier({ text: 'data' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createPatchMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'patch',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'data',
        type: tsc.typeReferenceNode({ typeName: 'any' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'body' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'PATCH' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  key: 'body',
                  value: tsc.identifier({ text: 'data' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createDeleteMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'delete',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'DELETE' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createHeadMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'head',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'HEAD' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

const createOptionsMethod = () => {
  return tsc.methodDeclaration({
    accessLevel: 'public',
    name: 'options',
    parameters: [
      {
        name: 'url',
        type: tsc.typeReferenceNode({ typeName: 'string' }),
      },
      {
        name: 'options',
        type: tsc.typeReferenceNode({
          typeArguments: [
            tsc.typeReferenceNode({ typeName: 'RequestOptions' }),
            tsc.typeUnionNode({
              types: [
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'method' }),
                }),
                tsc.literalTypeNode({
                  literal: tsc.stringLiteral({ text: 'url' }),
                }),
              ],
            }),
          ],
          typeName: 'Omit',
        }),
      },
    ],
    returnType: tsc.typeReferenceNode({
      typeArguments: [
        tsc.typeReferenceNode({
          typeArguments: [tsc.typeReferenceNode({ typeName: 'T' })],
          typeName: 'AxiosResponse',
        }),
      ],
      typeName: 'Promise',
    }),
    statements: [
      tsc.returnStatement({
        expression: tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.this(),
            name: tsc.identifier({ text: 'request' }),
          }),
          parameters: [
            tsc.objectExpression({
              obj: [
                {
                  key: 'method',
                  value: tsc.stringLiteral({ text: 'OPTIONS' }),
                },
                {
                  key: 'url',
                  value: tsc.identifier({ text: 'url' }),
                },
                {
                  spread: tsc.identifier({ text: 'options' }),
                },
              ],
            }),
          ],
          types: [tsc.typeReferenceNode({ typeName: 'T' })],
        }),
      }),
    ],
    types: [
      {
        default: 'any',
        name: 'T',
      },
    ],
  });
};

/**
 * Groups operations by their tags
 */
const groupOperationsByTags = (
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
          className: tag, // Will be processed later with naming conventions
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
 * Processes service groups and applies naming conventions with deduplication
 * FIX for Issue #3: Duplicate Service Class Names
 */
const processServiceGroups = (
  groups: Map<string, ServiceGroup>,
  clientName: string,
): Map<string, ServiceGroup> => {
  const processedGroups = new Map<string, ServiceGroup>();
  const usedClassNames = new Set<string>();

  for (const [tag, group] of groups) {
    let className = createServiceClassName(clientName, tag);

    // Handle duplicate class names - add numeric suffix
    let counter = 2;
    const baseClassName = className;
    while (usedClassNames.has(className)) {
      className = `${baseClassName}${counter}`;
      counter++;
    }
    usedClassNames.add(className);

    const processedGroup: ServiceGroup = {
      ...group,
      className,
    };
    processedGroups.set(tag, processedGroup);
  }

  return processedGroups;
};

/**
 * Generates method name for an operation in a service
 */
const generateOperationMethodName = (operation: IR.OperationObject): string => {
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

  // Get data type (request parameters)
  const dataSymbol = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'typescript',
  });
  const dataTypeName = dataSymbol?.placeholder || 'unknown';

  // Get response type
  const responseSymbol = plugin.querySymbol({
    category: 'type',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
  });
  const responseTypeName = responseSymbol?.placeholder;

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

  // Generate method implementation
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
 * Generates the URL expression with path parameter interpolation
 */
const generateUrlExpression = (
  operation: IR.OperationObject,
  hasParams: boolean,
) => {
  const path = operation.path;

  // Check if path has parameters like /users/{id}
  const pathParams = path.match(/\{([^}]+)\}/g);

  if (!pathParams || pathParams.length === 0) {
    // No path parameters, return static string
    return tsc.stringLiteral({ text: path });
  }

  if (!hasParams) {
    // Has path parameters but no options, return static string (shouldn't happen)
    return tsc.stringLiteral({ text: path });
  }

  // Build string concatenation with path parameter interpolation
  // e.g., /users/{id} becomes `/users/${options.path.id}`
  // which in code is: '/users/' + options.path.id
  const parts: Array<any> = [];
  let lastIndex = 0;

  pathParams.forEach((param) => {
    const paramName = param.slice(1, -1); // Remove { and }
    const paramIndex = path.indexOf(param, lastIndex);

    // Add the string part before the parameter
    if (paramIndex > lastIndex) {
      parts.push(
        tsc.stringLiteral({ text: path.slice(lastIndex, paramIndex) }),
      );
    }

    // Add the parameter access expression
    parts.push(
      tsc.propertyAccessExpression({
        expression: tsc.propertyAccessExpression({
          expression: tsc.identifier({ text: 'options' }),
          name: 'path',
        }),
        name: paramName,
      }),
    );

    lastIndex = paramIndex + param.length;
  });

  // Add remaining string after last parameter
  if (lastIndex < path.length) {
    parts.push(tsc.stringLiteral({ text: path.slice(lastIndex) }));
  }

  // If only one part, return it directly
  if (parts.length === 1) {
    return parts[0];
  }

  // Concatenate all parts with + operator using TypeScript factory directly
  let expression = parts[0];
  for (let i = 1; i < parts.length; i++) {
    expression = ts.factory.createBinaryExpression(
      expression,
      ts.SyntaxKind.PlusToken,
      parts[i],
    );
  }

  return expression;
};

/**
 * Generates the method implementation that calls the client
 */
const generateMethodImplementation = (
  operation: IR.OperationObject,
  hasParams: boolean,
) => {
  const methodName = operation.method.toLowerCase();
  const urlExpression = generateUrlExpression(operation, hasParams);

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
            // URL parameter - always use actual path from OpenAPI
            urlExpression,
            // Data parameter
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
            // Options parameter
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
            // URL parameter - always use actual path from OpenAPI
            urlExpression,
            // Options parameter
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
