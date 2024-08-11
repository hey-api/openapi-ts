import path from 'node:path';

import ts from 'typescript';

import { compiler, Property, TypeScriptFile } from '../compiler';
import type { ImportExportItem } from '../compiler/module';
import { ImportExportItemObject } from '../compiler/utils';
import type { Operation } from '../openApi';
import type {
  Method,
  Model,
  OperationParameter,
} from '../openApi/common/interfaces/client';
import { isOperationParameterRequired } from '../openApi/common/parser/operation';
import type { Client } from '../types/client';
import type { Files } from '../types/utils';
import { getConfig, isStandaloneClient } from '../utils/config';
import { clientModulePath, clientOptionsTypeName } from './client';
import {
  generateImport,
  operationDataTypeName,
  operationErrorTypeName,
  operationOptionsType,
  operationResponseTypeName,
  toOperationName,
} from './services';

const toInfiniteQueryOptionsName = (operation: Operation) =>
  `${toOperationName(operation, false)}InfiniteOptions`;

const toMutationOptionsName = (operation: Operation) =>
  `${toOperationName(operation, false)}Mutation`;

const toQueryOptionsName = (operation: Operation) =>
  `${toOperationName(operation, false)}Options`;

export const generatePlugins = async ({
  client,
  files,
}: {
  client: Client;
  files: Files;
}) => {
  const config = getConfig();

  const isStandalone = isStandaloneClient(config);

  if (!isStandalone) {
    // plugins work only with standalone clients
    return;
  }

  for (const plugin of config.plugins) {
    const outputParts = plugin.output.split('/');
    const outputDir = path.resolve(
      config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    files[plugin.name] = new TypeScriptFile({
      dir: outputDir,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    const file = files[plugin.name];

    if (
      plugin.name === '@tanstack/react-query' ||
      plugin.name === '@tanstack/vue-query'
    ) {
      const paginationWordsRegExp = /^(cursor|offset|page|start)/;

      if (!files.services) {
        // TODO: throw
      }
      if (!files.types) {
        // TODO: throw
      }

      file.import({
        asType: true,
        module: clientModulePath(),
        name: clientOptionsTypeName(),
      });

      const relativePath =
        new Array(outputParts.length).fill('').join('../') || './';
      const servicesModulePath = relativePath + files.services.getName(false);
      const typesModulePath = relativePath + files.types.getName(false);

      const createQueryKeyParamsFn = 'createQueryKeyParams';
      const infiniteQueryOptionsFn = 'infiniteQueryOptions';
      const mutationsType = 'UseMutationOptions';
      const queryKeyName = 'QueryKey';
      const queryOptionsFn = 'queryOptions';
      const TOptionsType = 'TOptions';

      const getPaginationIn = (parameter: OperationParameter) => {
        switch (parameter.in) {
          case 'formData':
            return 'body';
          case 'header':
            return 'headers';
          default:
            return parameter.in;
        }
      };

      let hasCreateQueryKeyParamsFunction = false;
      const createQueryKeyParamsFunction = () => {
        hasCreateQueryKeyParamsFunction = true;

        const returnType = compiler.indexedAccessTypeNode({
          indexType: ts.factory.createLiteralTypeNode(
            compiler.stringLiteral({ text: 'params' }),
          ),
          objectType: compiler.indexedAccessTypeNode({
            indexType: compiler.typeNode(0),
            objectType: compiler.typeNode(queryKeyName, [
              compiler.typeNode(TOptionsType),
            ]),
          }),
        });

        const queryKeyParamsFunction = compiler.constVariable({
          expression: compiler.arrowFunction({
            multiLine: true,
            parameters: [
              {
                isRequired: false,
                name: 'options',
                type: compiler.typeNode(TOptionsType),
              },
            ],
            returnType,
            statements: [
              compiler.constVariable({
                assertion: returnType,
                expression: compiler.objectExpression({
                  multiLine: false,
                  obj: [],
                }),
                name: 'params',
                typeName: returnType,
              }),
              compiler.ifStatement({
                expression: compiler.propertyAccessExpression({
                  expression: compiler.identifier({ text: 'options' }),
                  isOptional: true,
                  name: compiler.identifier({ text: 'body' }),
                }),
                thenStatement: ts.factory.createBlock(
                  [
                    compiler.expressionToStatement({
                      expression: compiler.binaryExpression({
                        left: compiler.propertyAccessExpression({
                          expression: 'params',
                          name: 'body',
                        }),
                        right: compiler.propertyAccessExpression({
                          expression: 'options',
                          name: 'body',
                        }),
                      }),
                    }),
                  ],
                  true,
                ),
              }),
              compiler.ifStatement({
                expression: compiler.propertyAccessExpression({
                  expression: compiler.identifier({ text: 'options' }),
                  isOptional: true,
                  name: compiler.identifier({ text: 'headers' }),
                }),
                thenStatement: ts.factory.createBlock(
                  [
                    compiler.expressionToStatement({
                      expression: compiler.binaryExpression({
                        left: compiler.propertyAccessExpression({
                          expression: 'params',
                          name: 'headers',
                        }),
                        right: compiler.propertyAccessExpression({
                          expression: 'options',
                          name: 'headers',
                        }),
                      }),
                    }),
                  ],
                  true,
                ),
              }),
              compiler.ifStatement({
                expression: compiler.propertyAccessExpression({
                  expression: compiler.identifier({ text: 'options' }),
                  isOptional: true,
                  name: compiler.identifier({ text: 'path' }),
                }),
                thenStatement: ts.factory.createBlock(
                  [
                    compiler.expressionToStatement({
                      expression: compiler.binaryExpression({
                        left: compiler.propertyAccessExpression({
                          expression: 'params',
                          name: 'path',
                        }),
                        right: compiler.propertyAccessExpression({
                          expression: 'options',
                          name: 'path',
                        }),
                      }),
                    }),
                  ],
                  true,
                ),
              }),
              compiler.ifStatement({
                expression: compiler.propertyAccessExpression({
                  expression: compiler.identifier({ text: 'options' }),
                  isOptional: true,
                  name: compiler.identifier({ text: 'query' }),
                }),
                thenStatement: ts.factory.createBlock(
                  [
                    compiler.expressionToStatement({
                      expression: compiler.binaryExpression({
                        left: compiler.propertyAccessExpression({
                          expression: 'params',
                          name: 'query',
                        }),
                        right: compiler.propertyAccessExpression({
                          expression: 'options',
                          name: 'query',
                        }),
                      }),
                    }),
                  ],
                  true,
                ),
              }),
              compiler.returnVariable({
                name: 'params',
              }),
            ],
            types: [
              {
                extends: compiler.typeReferenceNode({
                  typeName: compiler.identifier({
                    text: clientOptionsTypeName(),
                  }),
                }),
                name: TOptionsType,
              },
            ],
          }),
          name: createQueryKeyParamsFn,
        });
        file.add(queryKeyParamsFunction);
      };

      const createQueryKeyLiteral = ({
        isInfinite,
        operation,
      }: {
        isInfinite?: boolean;
        operation: Operation;
      }) => {
        const queryKeyLiteral = compiler.arrayLiteralExpression({
          elements: [
            compiler.objectExpression({
              obj: [
                isInfinite && {
                  key: 'infinite',
                  value: true,
                },
                {
                  key: 'params',
                  value: compiler.callExpression({
                    functionName: createQueryKeyParamsFn,
                    parameters: ['options'],
                  }),
                },
                {
                  key: 'scope',
                  value: operation.name,
                },
              ].filter(Boolean),
            }),
          ],
        });
        return queryKeyLiteral;
      };

      const createQueryKeyType = () => {
        const properties: Property[] = [
          {
            isRequired: false,
            name: 'infinite',
            type: compiler.keywordTypeNode({
              keyword: 'boolean',
            }),
          },
          {
            name: 'params',
            type: compiler.typeReferenceNode({
              typeArguments: [
                compiler.typeReferenceNode({
                  typeName: compiler.identifier({ text: TOptionsType }),
                }),
                compiler.typeUnionNode(
                  ['body', 'headers', 'path', 'query'].map((key) =>
                    ts.factory.createLiteralTypeNode(
                      compiler.stringLiteral({ text: key }),
                    ),
                  ),
                ),
              ],
              typeName: compiler.identifier({ text: 'Pick' }),
            }),
          },
          {
            name: 'scope',
            type: compiler.keywordTypeNode({
              keyword: 'string',
            }),
          },
        ];

        const queryKeyType = compiler.typeAliasDeclaration({
          name: queryKeyName,
          type: compiler.typeTupleNode({
            types: [compiler.typeInterfaceNode({ properties })],
          }),
          typeParameters: [
            {
              extends: compiler.typeReferenceNode({
                typeName: compiler.identifier({
                  text: clientOptionsTypeName(),
                }),
              }),
              name: TOptionsType,
            },
          ],
        });
        file.add(queryKeyType);
      };

      const createTypeData = ({ operation }: { operation: Operation }) => {
        const { name: nameTypeData } = generateImport({
          client,
          meta: operation.parameters.length
            ? {
                // TODO: this should be exact ref to operation for consistency,
                // but name should work too as operation ID is unique
                $ref: operation.name,
                name: operation.name,
              }
            : undefined,
          nameTransformer: operationDataTypeName,
          onImport: (name) => {
            file.import({
              asType: true,
              module: typesModulePath,
              name,
            });
          },
        });

        const typeData = operationOptionsType(nameTypeData);

        return { typeData };
      };

      const createTypeError = ({ operation }: { operation: Operation }) => {
        const { name: nameTypeError } = generateImport({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationErrorTypeName,
          onImport: (name) => {
            file.import({
              asType: true,
              module: typesModulePath,
              name,
            });
          },
        });

        let typeError: ImportExportItemObject = {
          asType: true,
          name: nameTypeError,
        };
        if (!typeError.name) {
          typeError = file.import({
            asType: true,
            module: plugin.name,
            name: 'DefaultError',
          });
        }

        if (config.client.name === '@hey-api/client-axios') {
          const axiosError = file.import({
            asType: true,
            module: 'axios',
            name: 'AxiosError',
          });
          typeError = {
            ...axiosError,
            name: `${axiosError.name}<${typeError.name}>`,
          };
        }

        return { typeError };
      };

      const createTypeResponse = ({ operation }: { operation: Operation }) => {
        const { name: nameTypeResponse } = generateImport({
          client,
          meta: {
            // TODO: this should be exact ref to operation for consistency,
            // but name should work too as operation ID is unique
            $ref: operation.name,
            name: operation.name,
          },
          nameTransformer: operationResponseTypeName,
          onImport: (imported) => {
            file.import({
              asType: true,
              module: typesModulePath,
              name: imported,
            });
          },
        });

        const typeResponse = nameTypeResponse || 'void';

        return { typeResponse };
      };

      let typeInfiniteData!: ImportExportItem;
      let hasInfiniteQueries = false;
      let hasMutations = false;
      let hasQueries = false;

      for (const service of client.services) {
        for (const operation of service.operations) {
          const queryFn = toOperationName(operation, true);
          let hasUsedQueryFn = false;

          // queries
          if (
            plugin.queryOptions &&
            (['GET', 'POST'] as ReadonlyArray<Method>).includes(
              operation.method,
            )
          ) {
            if (!hasQueries) {
              hasQueries = true;

              if (!hasCreateQueryKeyParamsFunction) {
                createQueryKeyType();
                createQueryKeyParamsFunction();
              }

              file.import({
                module: plugin.name,
                name: queryOptionsFn,
              });
            }

            hasUsedQueryFn = true;

            const { typeData } = createTypeData({ operation });

            const isRequired = isOperationParameterRequired(
              operation.parameters,
            );

            const expression = compiler.arrowFunction({
              parameters: [
                {
                  isRequired,
                  name: 'options',
                  type: typeData,
                },
              ],
              statements: [
                compiler.returnFunctionCall({
                  args: [
                    compiler.objectExpression({
                      obj: [
                        {
                          key: 'queryFn',
                          value: compiler.arrowFunction({
                            async: true,
                            multiLine: true,
                            parameters: [
                              {
                                destructure: [
                                  {
                                    name: 'queryKey',
                                  },
                                ],
                              },
                            ],
                            statements: [
                              compiler.constVariable({
                                destructure: true,
                                expression: compiler.awaitExpression({
                                  expression: compiler.callExpression({
                                    functionName: queryFn,
                                    parameters: [
                                      compiler.objectExpression({
                                        multiLine: true,
                                        obj: [
                                          {
                                            spread: 'options',
                                          },
                                          {
                                            spread: 'queryKey[0].params',
                                          },
                                          {
                                            key: 'throwOnError',
                                            value: true,
                                          },
                                        ],
                                      }),
                                    ],
                                  }),
                                }),
                                name: 'data',
                              }),
                              compiler.returnVariable({
                                name: 'data',
                              }),
                            ],
                          }),
                        },
                        {
                          key: 'queryKey',
                          value: createQueryKeyLiteral({
                            operation,
                          }),
                        },
                      ],
                    }),
                  ],
                  name: queryOptionsFn,
                }),
              ],
            });
            const statement = compiler.constVariable({
              // TODO: describe options, same as the actual function call
              comment: [],
              exportConst: true,
              expression,
              name: toQueryOptionsName(operation),
              // TODO: add type error
              // TODO: AxiosError<PutSubmissionMetaError>
            });
            file.add(statement);
          }

          // infinite queries
          if (
            plugin.infiniteQueryOptions &&
            (['GET', 'POST'] as ReadonlyArray<Method>).includes(
              operation.method,
            )
          ) {
            // the actual pagination field might be nested inside parameter, e.g. body
            let paginationField!: Model | OperationParameter;

            const paginationParameter = operation.parameters.find(
              (parameter) => {
                if (paginationWordsRegExp.test(parameter.name)) {
                  paginationField = parameter;
                  return true;
                }

                if (parameter.in !== 'body') {
                  return;
                }

                if (parameter.export === 'reference') {
                  const ref = parameter.$refs[0];
                  const refModel = client.models.find(
                    (model) => model.meta?.$ref === ref,
                  );
                  return refModel?.properties.find((property) => {
                    if (paginationWordsRegExp.test(property.name)) {
                      paginationField = property;
                      return true;
                    }
                  });
                }

                return parameter.properties.find((property) => {
                  if (paginationWordsRegExp.test(property.name)) {
                    paginationField = property;
                    return true;
                  }
                });
              },
            );

            if (paginationParameter && paginationField) {
              if (!hasInfiniteQueries) {
                hasInfiniteQueries = true;

                if (!hasCreateQueryKeyParamsFunction) {
                  createQueryKeyType();
                  createQueryKeyParamsFunction();
                }

                file.import({
                  module: plugin.name,
                  name: infiniteQueryOptionsFn,
                });

                typeInfiniteData = file.import({
                  asType: true,
                  module: plugin.name,
                  name: 'InfiniteData',
                });
              }

              hasUsedQueryFn = true;

              const { typeData } = createTypeData({ operation });
              const { typeError } = createTypeError({ operation });
              const { typeResponse } = createTypeResponse({ operation });

              const isRequired = isOperationParameterRequired(
                operation.parameters,
              );

              const typeQueryKey = `${queryKeyName}<${typeData}>`;
              const typePageObjectParam = `${typeQueryKey}[0]['params']`;
              const typePageParam = `${paginationField.base} | ${typePageObjectParam}`;

              const expression = compiler.arrowFunction({
                parameters: [
                  {
                    isRequired,
                    name: 'options',
                    type: typeData,
                  },
                ],
                statements: [
                  compiler.returnFunctionCall({
                    args: [
                      compiler.objectExpression({
                        comments: [
                          {
                            jsdoc: false,
                            lines: ['@ts-ignore'],
                          },
                        ],
                        obj: [
                          {
                            key: 'queryFn',
                            value: compiler.arrowFunction({
                              async: true,
                              multiLine: true,
                              parameters: [
                                {
                                  destructure: [
                                    {
                                      name: 'pageParam',
                                    },
                                    {
                                      name: 'queryKey',
                                    },
                                  ],
                                },
                              ],
                              statements: [
                                compiler.constVariable({
                                  comment: [
                                    {
                                      jsdoc: false,
                                      lines: ['@ts-ignore'],
                                    },
                                  ],
                                  expression: compiler.conditionalExpression({
                                    condition: compiler.binaryExpression({
                                      left: compiler.typeOfExpression({
                                        text: 'pageParam',
                                      }),
                                      operator: '===',
                                      right: compiler.stringLiteral({
                                        text: 'object',
                                      }),
                                    }),
                                    whenFalse: compiler.objectExpression({
                                      multiLine: true,
                                      obj: [
                                        {
                                          key: getPaginationIn(
                                            paginationParameter,
                                          ),
                                          value: compiler.objectExpression({
                                            multiLine: true,
                                            obj: [
                                              {
                                                key: paginationField.name,
                                                value: compiler.identifier({
                                                  text: 'pageParam',
                                                }),
                                              },
                                            ],
                                          }),
                                        },
                                      ],
                                    }),
                                    whenTrue: compiler.identifier({
                                      text: 'pageParam',
                                    }),
                                  }),
                                  name: 'page',
                                  typeName: typePageObjectParam,
                                }),
                                compiler.constVariable({
                                  destructure: true,
                                  expression: compiler.awaitExpression({
                                    expression: compiler.callExpression({
                                      functionName: queryFn,
                                      parameters: [
                                        compiler.objectExpression({
                                          multiLine: true,
                                          obj: [
                                            {
                                              spread: 'options',
                                            },
                                            {
                                              key: 'body',
                                              value: compiler.objectExpression({
                                                multiLine: true,
                                                obj: [
                                                  {
                                                    assertion: 'any',
                                                    spread:
                                                      'queryKey[0].params.body',
                                                  },
                                                  {
                                                    assertion: 'any',
                                                    spread: 'page.body',
                                                  },
                                                ],
                                              }),
                                            },
                                            {
                                              key: 'headers',
                                              value: compiler.objectExpression({
                                                multiLine: true,
                                                obj: [
                                                  {
                                                    spread:
                                                      'queryKey[0].params.headers',
                                                  },
                                                  {
                                                    spread: 'page.headers',
                                                  },
                                                ],
                                              }),
                                            },
                                            {
                                              key: 'path',
                                              value: compiler.objectExpression({
                                                multiLine: true,
                                                obj: [
                                                  {
                                                    spread:
                                                      'queryKey[0].params.path',
                                                  },
                                                  {
                                                    spread: 'page.path',
                                                  },
                                                ],
                                              }),
                                            },
                                            {
                                              key: 'query',
                                              value: compiler.objectExpression({
                                                multiLine: true,
                                                obj: [
                                                  {
                                                    spread:
                                                      'queryKey[0].params.query',
                                                  },
                                                  {
                                                    spread: 'page.query',
                                                  },
                                                ],
                                              }),
                                            },
                                            {
                                              key: 'throwOnError',
                                              value: true,
                                            },
                                          ],
                                        }),
                                      ],
                                    }),
                                  }),
                                  name: 'data',
                                }),
                                compiler.returnVariable({
                                  name: 'data',
                                }),
                              ],
                            }),
                          },
                          {
                            key: 'queryKey',
                            value: createQueryKeyLiteral({
                              isInfinite: true,
                              operation,
                            }),
                          },
                        ],
                      }),
                    ],
                    name: infiniteQueryOptionsFn,
                    // TODO: better types syntax
                    types: [
                      typeResponse,
                      typeError.name,
                      `${typeof typeInfiniteData === 'string' ? typeInfiniteData : typeInfiniteData.name}<${typeResponse}>`,
                      typeQueryKey,
                      typePageParam,
                    ],
                  }),
                ],
              });
              const statement = compiler.constVariable({
                // TODO: describe options, same as the actual function call
                comment: [],
                exportConst: true,
                expression,
                name: toInfiniteQueryOptionsName(operation),
              });
              file.add(statement);
            }
          }

          // mutations
          if (
            plugin.mutationOptions &&
            (
              ['DELETE', 'PATCH', 'POST', 'PUT'] as ReadonlyArray<Method>
            ).includes(operation.method)
          ) {
            if (!hasMutations) {
              hasMutations = true;

              file.import({
                asType: true,
                module: plugin.name,
                name: mutationsType,
              });
            }

            hasUsedQueryFn = true;

            const { typeData } = createTypeData({ operation });
            const { typeError } = createTypeError({ operation });
            const { typeResponse } = createTypeResponse({ operation });

            const statement = compiler.constVariable({
              // TODO: describe options, same as the actual function call
              comment: [],
              exportConst: true,
              expression: compiler.objectExpression({
                obj: [
                  {
                    key: 'mutationFn',
                    value: compiler.arrowFunction({
                      async: true,
                      multiLine: true,
                      parameters: [
                        {
                          name: 'options',
                        },
                      ],
                      statements: [
                        compiler.constVariable({
                          destructure: true,
                          expression: compiler.awaitExpression({
                            expression: compiler.callExpression({
                              functionName: queryFn,
                              parameters: [
                                compiler.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      spread: 'options',
                                    },
                                    {
                                      key: 'throwOnError',
                                      value: true,
                                    },
                                  ],
                                }),
                              ],
                            }),
                          }),
                          name: 'data',
                        }),
                        compiler.returnVariable({
                          name: 'data',
                        }),
                      ],
                    }),
                  },
                ],
              }),
              name: toMutationOptionsName(operation),
              // TODO: better types syntax
              typeName: `${mutationsType}<${typeResponse}, ${typeError.name}, ${typeData}>`,
            });
            file.add(statement);
          }

          if (hasUsedQueryFn) {
            file.import({
              module: servicesModulePath,
              name: queryFn,
            });
          }
        }
      }
    }
  }
};
