import { tsc } from '../../../tsc';
import type { HeyApiClientNestjsPlugin } from './types';
import {
  createClientClassName,
  createClientConfigToken,
  getClientName,
} from './utils';

/**
 * Generates the NestJS injectable client class using TypeScript compiler API
 */
export const generateNestjsClient = ({
  plugin,
}: {
  plugin: Parameters<HeyApiClientNestjsPlugin['Handler']>[0]['plugin'];
}) => {
  const clientName = getClientName(plugin.config);
  const clientClassName =
    plugin.config.clientClassName || createClientClassName(clientName);
  const configToken = createClientConfigToken(clientName);

  // Create the client file
  const file = plugin.createFile({
    id: 'nestjs-client',
    path: `${plugin.output}/${clientName.toLowerCase()}-client.service`,
  });

  // Add imports
  const nestjsImport = tsc.namedImportDeclarations({
    imports: ['Injectable', 'Inject'],
    module: '@nestjs/common',
  });
  file.add(nestjsImport);

  const axiosImport = tsc.defaultImportDeclaration({
    module: 'axios',
    name: 'axios',
  });
  file.add(axiosImport);

  const axiosTypesImport = tsc.namedImportDeclarations({
    imports: [
      { asType: true, name: 'AxiosInstance' },
      { asType: true, name: 'AxiosRequestConfig' },
      { asType: true, name: 'AxiosResponse' },
      { asType: true, name: 'RawAxiosRequestHeaders' },
    ],
    module: 'axios',
  });
  file.add(axiosTypesImport);

  const typesImport = tsc.namedImportDeclarations({
    imports: [
      { asType: true, name: 'ClientModuleConfig' },
      { asType: true, name: 'RequestOptions' },
    ],
    module: './types.gen',
  });
  file.add(typesImport);

  // Create the injectable client class
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
        modifier: 'private',
        name: 'axiosInstance',
        type: tsc.typeReferenceNode({ typeName: 'AxiosInstance' }),
      }),

      // Constructor with dependency injection
      tsc.constructorDeclaration({
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
      }),

      // Generic request method
      tsc.methodDeclaration({
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
          // Prepare axios request config following client-axios pattern
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

          // Make the request and return formatted response
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
      }),

      // GET method
      tsc.methodDeclaration({
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
      }),

      // POST method
      tsc.methodDeclaration({
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
      }),

      // PUT method
      tsc.methodDeclaration({
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
      }),

      // PATCH method
      tsc.methodDeclaration({
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
      }),

      // DELETE method
      tsc.methodDeclaration({
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
      }),

      // HEAD method
      tsc.methodDeclaration({
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
      }),

      // OPTIONS method
      tsc.methodDeclaration({
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
      }),
    ],
  });

  file.add(clientClass);

  // Export the config token
  const configTokenExport = tsc.constVariable({
    exportConst: true,
    expression: tsc.stringLiteral({ text: configToken }),
    name: configToken,
  });
  file.add(configTokenExport);

  return {
    clientClassName,
    configToken,
  };
};
