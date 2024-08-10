import path from 'node:path';

import ts from 'typescript';

import { compiler, Property, TypeScriptFile } from '../compiler';
import type { ImportExportItem } from '../compiler/module';
import type { ImportExportItemObject } from '../compiler/utils';
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
import { unique } from '../utils/unique';
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

    if (plugin.name === '@tanstack/react-query') {
      const paginationWordsRegExp = /^(cursor|offset|page|start)/;

      files[plugin.name].addImport({
        imports: [
          {
            asType: true,
            name: clientOptionsTypeName(),
          },
        ],
        module: clientModulePath(),
      });

      let imports: string[] = [];
      let importsServices: ImportExportItem[] = [];

      const createQueryKeyParamsFn = 'createQueryKeyParams';
      const infiniteQueryOptionsFn = 'infiniteQueryOptions';
      const mutationsType = 'UseMutationOptions';
      const optionsType = 'Options';
      const queryKeyName = 'QueryKey';
      const queryOptionsFn = 'queryOptions';
      const TOptionsType = 'TOptions';

      // TODO: `addTanStackQueryImport()` should be a method of file class to create
      // unique imports. It could be made more performant too
      let importsTanStackQuery: ImportExportItemObject[] = [];
      const addTanStackQueryImport = (
        imported: ImportExportItem,
      ): ImportExportItemObject => {
        const importedItem: ImportExportItemObject =
          typeof imported === 'string'
            ? {
                name: imported,
              }
            : imported;
        const match = importsTanStackQuery.find(
          (item) => item.name === importedItem.name,
        );
        if (match) {
          return match;
        }

        importsTanStackQuery = [...importsTanStackQuery, importedItem];
        return importedItem;
      };

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
                  typeName: compiler.identifier({ text: optionsType }),
                }),
                name: TOptionsType,
              },
            ],
          }),
          name: createQueryKeyParamsFn,
        });
        files[plugin.name].add(queryKeyParamsFunction);
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
                typeName: compiler.identifier({ text: optionsType }),
              }),
              name: TOptionsType,
            },
          ],
        });
        files[plugin.name].add(queryKeyType);
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

              addTanStackQueryImport(queryOptionsFn);
            }

            hasUsedQueryFn = true;

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
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });

            const isRequired = isOperationParameterRequired(
              operation.parameters,
            );

            const expression = compiler.arrowFunction({
              parameters: [
                {
                  isRequired,
                  name: 'options',
                  type: operationOptionsType(nameTypeData),
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
            });
            files[plugin.name].add(statement);
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

                addTanStackQueryImport(infiniteQueryOptionsFn);

                typeInfiniteData = addTanStackQueryImport({
                  asType: true,
                  name: 'InfiniteData',
                });
              }

              hasUsedQueryFn = true;

              const { name: nameTypeError } = generateImport({
                client,
                meta: {
                  // TODO: this should be exact ref to operation for consistency,
                  // but name should work too as operation ID is unique
                  $ref: operation.name,
                  name: operation.name,
                },
                nameTransformer: operationErrorTypeName,
                onImport: (imported) => {
                  imports = [...imports, imported];
                },
              });

              let typeError: ImportExportItem = nameTypeError;
              if (!typeError) {
                typeError = addTanStackQueryImport({
                  asType: true,
                  name: 'DefaultError',
                });
              }

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
                onImport: (imported) => {
                  imports = [...imports, imported];
                },
              });

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
                  imports = [...imports, imported];
                },
              });

              const typeResponse = nameTypeResponse || 'void';

              const isRequired = isOperationParameterRequired(
                operation.parameters,
              );

              const typeQueryKey = `${queryKeyName}<${optionsType}<${nameTypeData}>>`;
              const typePageObjectParam = `${typeQueryKey}[0]['params']`;
              const typePageParam = `${paginationField.base} | ${typePageObjectParam}`;

              const expression = compiler.arrowFunction({
                parameters: [
                  {
                    isRequired,
                    name: 'options',
                    type: operationOptionsType(nameTypeData),
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
                      typeof typeError === 'string'
                        ? typeError
                        : typeError.name,
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
              files[plugin.name].add(statement);
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

              addTanStackQueryImport({
                asType: true,
                name: mutationsType,
              });
            }

            hasUsedQueryFn = true;

            const { name: nameTypeError } = generateImport({
              client,
              meta: {
                // TODO: this should be exact ref to operation for consistency,
                // but name should work too as operation ID is unique
                $ref: operation.name,
                name: operation.name,
              },
              nameTransformer: operationErrorTypeName,
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });

            let typeError: ImportExportItem = nameTypeError;
            if (!typeError) {
              typeError = addTanStackQueryImport({
                asType: true,
                name: 'DefaultError',
              });
            }

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
              onImport: (imported) => {
                imports = [...imports, imported];
              },
            });

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
                imports = [...imports, imported];
              },
            });

            const typeResponse = nameTypeResponse || 'void';

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
              typeName: `${mutationsType}<${typeResponse}, ${typeof typeError === 'string' ? typeError : typeError.name}, ${operationOptionsType(nameTypeData)}>`,
            });
            files[plugin.name].add(statement);
          }

          if (hasUsedQueryFn && !importsServices.includes(queryFn)) {
            importsServices = [...importsServices, queryFn];
          }
        }
      }

      if (importsTanStackQuery.length) {
        files[plugin.name].addImport({
          imports: importsTanStackQuery,
          module: '@tanstack/react-query',
        });
      }

      const relativePath =
        new Array(outputParts.length).fill('').join('../') || './';

      if (importsServices.length && files.services) {
        files[plugin.name].addImport({
          imports: importsServices,
          module: relativePath + files.services.getName(false),
        });
      }

      if (files.types && !files.types.isEmpty()) {
        const importedTypes = imports.filter(unique).map((name) => ({
          asType: true,
          name,
        }));
        if (importedTypes.length) {
          files[plugin.name].addImport({
            imports: importedTypes,
            module: relativePath + files.types.getName(false),
          });
        }
      }
    }
  }
};
