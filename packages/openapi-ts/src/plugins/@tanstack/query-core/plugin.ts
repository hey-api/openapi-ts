import ts from 'typescript';

import { compiler, type Property } from '../../../compiler';
import type { ImportExportItem } from '../../../compiler/module';
import {
  type ImportExportItemObject,
  tsNodeToString,
} from '../../../compiler/utils';
import {
  clientModulePath,
  clientOptionsTypeName,
} from '../../../generate/client';
import {
  operationOptionsType,
  serviceFunctionIdentifier,
} from '../../../generate/services';
import { relativeModulePath } from '../../../generate/utils';
import type { IRContext } from '../../../ir/context';
import type {
  IROperationObject,
  IRPathItemObject,
  IRPathsObject,
} from '../../../ir/ir';
import {
  hasOperationDataRequired,
  operationPagination,
} from '../../../ir/operation';
import type { Files } from '../../../types/utils';
import { getConfig } from '../../../utils/config';
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
import {
  operationDataRef,
  operationErrorRef,
  operationResponseRef,
} from '../../@hey-api/services/plugin';
import { schemaToType } from '../../@hey-api/types/plugin';
import type { PluginHandler } from '../../types';
import type { PluginConfig as ReactQueryPluginConfig } from '../react-query';
import type { PluginConfig as SolidQueryPluginConfig } from '../solid-query';
import type { PluginConfig as SvelteQueryPluginConfig } from '../svelte-query';
import type { PluginConfig as VueQueryPluginConfig } from '../vue-query';

const infiniteQueryOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}InfiniteOptions`;

const mutationOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}Mutation`;

const queryOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IRContext;
  operation: IROperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}Options`;

const queryKeyFunctionIdentifier = ({
  context,
  operation,
  isInfinite,
}: {
  context: IRContext;
  isInfinite?: boolean;
  operation: IROperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}${isInfinite ? 'Infinite' : ''}QueryKey`;

const createInfiniteParamsFn = 'createInfiniteParams';
const createQueryKeyFn = 'createQueryKey';
const infiniteQueryOptionsFn = 'infiniteQueryOptions';
const mutationOptionsFn = 'mutationOptions';
const queryKeyName = 'QueryKey';
const queryOptionsFn = 'queryOptions';
const TOptionsType = 'TOptions';

const getClientBaseUrlKey = () => {
  const config = getConfig();
  return config.client.name === '@hey-api/client-axios' ? 'baseURL' : 'baseUrl';
};

const createInfiniteParamsFunction = ({
  file,
}: {
  file: Files[keyof Files];
}) => {
  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: compiler.typeReferenceNode({ typeName: 'QueryKey<Options>' }),
        },
        {
          name: 'page',
          type: compiler.typeReferenceNode({ typeName: 'K' }),
        },
      ],
      statements: [
        compiler.constVariable({
          expression: compiler.identifier({
            text: 'queryKey[0]',
          }),
          name: 'params',
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].body',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.body',
                      },
                    ],
                  }),
                }),
              }),
            ],
            true,
          ),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        spread: 'queryKey[0].headers',
                      },
                      {
                        spread: 'page.headers',
                      },
                    ],
                  }),
                }),
              }),
            ],
            true,
          ),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        spread: 'queryKey[0].path',
                      },
                      {
                        spread: 'page.path',
                      },
                    ],
                  }),
                }),
              }),
            ],
            true,
          ),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
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
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        spread: 'queryKey[0].query',
                      },
                      {
                        spread: 'page.query',
                      },
                    ],
                  }),
                }),
              }),
            ],
            true,
          ),
        }),
        compiler.returnVariable({
          expression: ts.factory.createAsExpression(
            ts.factory.createAsExpression(
              compiler.identifier({ text: 'params' }),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ),
            ts.factory.createTypeQueryNode(
              compiler.identifier({ text: 'page' }),
            ),
          ),
        }),
      ],
      types: [
        {
          extends: compiler.typeReferenceNode({
            typeName: compiler.identifier({
              text: "Pick<QueryKey<Options>[0], 'body' | 'headers' | 'path' | 'query'>",
            }),
          }),
          name: 'K',
        },
      ],
    }),
    name: createInfiniteParamsFn,
  });
  file.add(fn);
};

const createQueryKeyFunction = ({ file }: { file: Files[keyof Files] }) => {
  const returnType = compiler.indexedAccessTypeNode({
    indexType: compiler.literalTypeNode({
      literal: compiler.ots.number(0),
    }),
    objectType: compiler.typeReferenceNode({
      typeArguments: [compiler.typeReferenceNode({ typeName: TOptionsType })],
      typeName: queryKeyName,
    }),
  });

  const infiniteIdentifier = compiler.identifier({ text: 'infinite' });

  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'id',
          type: compiler.typeReferenceNode({ typeName: 'string' }),
        },
        {
          isRequired: false,
          name: 'options',
          type: compiler.typeReferenceNode({ typeName: TOptionsType }),
        },
        {
          isRequired: false,
          name: 'infinite',
          type: compiler.typeReferenceNode({ typeName: 'boolean' }),
        },
      ],
      returnType,
      statements: [
        compiler.constVariable({
          assertion: returnType,
          expression: compiler.objectExpression({
            multiLine: false,
            obj: [
              {
                key: '_id',
                value: compiler.identifier({ text: 'id' }),
              },
              {
                key: getClientBaseUrlKey(),
                value: compiler.identifier({
                  text: `(options?.client ?? client).getConfig().${getClientBaseUrlKey()}`,
                }),
              },
            ],
          }),
          name: 'params',
          typeName: returnType,
        }),
        compiler.ifStatement({
          expression: infiniteIdentifier,
          thenStatement: ts.factory.createBlock(
            [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: '_infinite',
                  }),
                  right: infiniteIdentifier,
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
          expression: 'params',
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
    name: createQueryKeyFn,
  });
  file.add(fn);
};

const createQueryKeyType = ({ file }: { file: Files[keyof Files] }) => {
  const properties: Property[] = [
    {
      name: '_id',
      type: compiler.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: compiler.keywordTypeNode({
        keyword: 'boolean',
      }),
    },
  ];

  const queryKeyType = compiler.typeAliasDeclaration({
    name: queryKeyName,
    type: compiler.typeTupleNode({
      types: [
        compiler.typeIntersectionNode({
          types: [
            compiler.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey()}' | 'body' | 'headers' | 'path' | 'query'>`,
            }),
            compiler.typeInterfaceNode({
              properties,
              useLegacyResolution: true,
            }),
          ],
        }),
      ],
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

const createQueryKeyLiteral = ({
  isInfinite,
  id,
}: {
  id: string;
  isInfinite?: boolean;
}) => {
  const queryKeyLiteral = compiler.arrayLiteralExpression({
    elements: [
      compiler.callExpression({
        functionName: createQueryKeyFn,
        parameters: [
          compiler.ots.string(id),
          'options',
          isInfinite ? compiler.ots.boolean(true) : undefined,
        ],
      }),
    ],
    multiLine: false,
  });
  return queryKeyLiteral;
};

const checkPrerequisites = ({ context }: { context: IRContext }) => {
  if (!context.file({ id: 'services' })) {
    throw new Error(
      '🚫 services need to be exported to use TanStack Query plugin - enable service generation',
    );
  }
};

interface Plugin {
  name: string;
  output: string;
}

const useTypeData = ({
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin;
}) => {
  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationDataRef({ id: operation.id }),
    namespace: 'type',
  });
  if (identifierData.name) {
    context.file({ id: plugin.name })!.import({
      asType: true,
      module: relativeModulePath({
        // TODO: parser - moduleOutput should be a full relative path to types file
        moduleOutput: context.file({ id: 'types' })!.nameWithoutExtension(),
        sourceOutput: plugin.output,
      }),
      name: identifierData.name,
    });
  }
  const typeData = operationOptionsType({
    importedType: identifierData.name,
  });
  return typeData;
};

const useTypeError = ({
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin;
}) => {
  const identifierError = context.file({ id: 'types' })!.identifier({
    $ref: operationErrorRef({ id: operation.id }),
    namespace: 'type',
  });
  if (identifierError.name) {
    context.file({ id: plugin.name })!.import({
      asType: true,
      module: relativeModulePath({
        // TODO: parser - moduleOutput should be a full relative path to types file
        moduleOutput: context.file({ id: 'types' })!.nameWithoutExtension(),
        sourceOutput: plugin.output,
      }),
      name: identifierError.name,
    });
  }
  let typeError: ImportExportItemObject = {
    asType: true,
    name: identifierError.name,
  };
  if (!typeError.name) {
    typeError = context.file({ id: plugin.name })!.import({
      asType: true,
      module: plugin.name,
      name: 'DefaultError',
    });
  }
  if (context.config.client.name === '@hey-api/client-axios') {
    const axiosError = context.file({ id: plugin.name })!.import({
      asType: true,
      module: 'axios',
      name: 'AxiosError',
    });
    typeError = {
      ...axiosError,
      name: `${axiosError.name}<${typeError.name}>`,
    };
  }
  return typeError;
};

const useTypeResponse = ({
  context,
  operation,
  plugin,
}: {
  context: IRContext;
  operation: IROperationObject;
  plugin: Plugin;
}) => {
  const identifierResponse = context.file({ id: 'types' })!.identifier({
    $ref: operationResponseRef({ id: operation.id }),
    namespace: 'type',
  });
  if (identifierResponse.name) {
    context.file({ id: plugin.name })!.import({
      asType: true,
      module: relativeModulePath({
        // TODO: parser - moduleOutput should be a full relative path to types file
        moduleOutput: context.file({ id: 'types' })!.nameWithoutExtension(),
        sourceOutput: plugin.output,
      }),
      name: identifierResponse.name,
    });
  }
  const typeResponse = identifierResponse.name || 'unknown';
  return typeResponse;
};

export const handler: PluginHandler<
  | ReactQueryPluginConfig
  | SolidQueryPluginConfig
  | SvelteQueryPluginConfig
  | VueQueryPluginConfig
> = ({ context, plugin }) => {
  checkPrerequisites({ context });

  const file = context.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  file.import({
    asType: true,
    module: clientModulePath({
      config: context.config,
      sourceOutput: plugin.output,
    }),
    name: clientOptionsTypeName(),
  });

  const mutationsType =
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';

  let typeInfiniteData!: ImportExportItem;
  let hasCreateInfiniteParamsFunction = false;
  let hasCreateQueryKeyParamsFunction = false;
  let hasInfiniteQueries = false;
  let hasMutations = false;
  let hasQueries = false;

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const queryFn = [
        context.config.services.asClass &&
          transformServiceName({
            config: context.config,
            name: getServiceName(operation.tags?.[0] || 'default'),
          }),
        serviceFunctionIdentifier({
          config: context.config,
          handleIllegal: !context.config.services.asClass,
          id: operation.id,
          operation,
        }),
      ]
        .filter(Boolean)
        .join('.');
      let hasUsedQueryFn = false;

      const isRequired = hasOperationDataRequired(operation);

      // queries
      if (
        plugin.queryOptions &&
        (['get', 'post'] as (typeof method)[]).includes(method)
      ) {
        if (!hasQueries) {
          hasQueries = true;

          if (!hasCreateQueryKeyParamsFunction) {
            createQueryKeyType({ file });
            createQueryKeyFunction({ file });
            hasCreateQueryKeyParamsFunction = true;
          }

          file.import({
            module: plugin.name,
            name: queryOptionsFn,
          });
        }

        hasUsedQueryFn = true;

        const typeData = useTypeData({ context, operation, plugin });

        const queryKeyStatement = compiler.constVariable({
          exportConst: true,
          expression: compiler.arrowFunction({
            parameters: [
              {
                isRequired,
                name: 'options',
                type: typeData,
              },
            ],
            statements: createQueryKeyLiteral({
              id: operation.id,
            }),
          }),
          name: queryKeyFunctionIdentifier({ context, operation }),
        });
        file.add(queryKeyStatement);

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
                                        spread: 'queryKey[0]',
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
                            expression: 'data',
                          }),
                        ],
                      }),
                    },
                    {
                      key: 'queryKey',
                      value: compiler.callExpression({
                        functionName: queryKeyFunctionIdentifier({
                          context,
                          operation,
                        }),
                        parameters: ['options'],
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
          name: queryOptionsFunctionIdentifier({ context, operation }),
          // TODO: add type error
          // TODO: AxiosError<PutSubmissionMetaError>
        });
        file.add(statement);
      }

      // infinite queries
      if (
        plugin.infiniteQueryOptions &&
        (['get', 'post'] as (typeof method)[]).includes(method)
      ) {
        const pagination = operationPagination(operation);

        if (pagination) {
          if (!hasInfiniteQueries) {
            hasInfiniteQueries = true;

            if (!hasCreateQueryKeyParamsFunction) {
              createQueryKeyType({ file });
              createQueryKeyFunction({ file });
              hasCreateQueryKeyParamsFunction = true;
            }

            if (!hasCreateInfiniteParamsFunction) {
              createInfiniteParamsFunction({ file });
              hasCreateInfiniteParamsFunction = true;
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

          const typeData = useTypeData({ context, operation, plugin });
          const typeError = useTypeError({ context, operation, plugin });
          const typeResponse = useTypeResponse({ context, operation, plugin });

          const typeQueryKey = `${queryKeyName}<${typeData}>`;
          const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
          // TODO: parser - this is a bit clunky, need to compile type to string because
          // `compiler.returnFunctionCall()` accepts only strings, should be cleaned up
          const typePageParam = `${tsNodeToString({
            node: schemaToType({
              context,
              schema: pagination.schema,
            }),
            unescape: true,
          })} | ${typePageObjectParam}`;

          const queryKeyStatement = compiler.constVariable({
            exportConst: true,
            expression: compiler.arrowFunction({
              parameters: [
                {
                  isRequired,
                  name: 'options',
                  type: typeData,
                },
              ],
              returnType: typeQueryKey,
              statements: createQueryKeyLiteral({
                id: operation.id,
                isInfinite: true,
              }),
            }),
            name: queryKeyFunctionIdentifier({
              context,
              isInfinite: true,
              operation,
            }),
          });
          file.add(queryKeyStatement);

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
                                  right: compiler.ots.string('object'),
                                }),
                                whenFalse: compiler.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      key: pagination.in,
                                      value: compiler.objectExpression({
                                        multiLine: true,
                                        obj: [
                                          {
                                            key: pagination.name,
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
                              expression: compiler.callExpression({
                                functionName: 'createInfiniteParams',
                                parameters: ['queryKey', 'page'],
                              }),
                              name: 'params',
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
                                          spread: 'params',
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
                              expression: 'data',
                            }),
                          ],
                        }),
                      },
                      {
                        key: 'queryKey',
                        value: compiler.callExpression({
                          functionName: queryKeyFunctionIdentifier({
                            context,
                            isInfinite: true,
                            operation,
                          }),
                          parameters: ['options'],
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
            name: infiniteQueryOptionsFunctionIdentifier({
              context,
              operation,
            }),
          });
          file.add(statement);
        }
      }

      // mutations
      if (
        plugin.mutationOptions &&
        (['delete', 'patch', 'post', 'put'] as (typeof method)[]).includes(
          method,
        )
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

        const typeData = useTypeData({ context, operation, plugin });
        const typeError = useTypeError({ context, operation, plugin });
        const typeResponse = useTypeResponse({ context, operation, plugin });

        const expression = compiler.arrowFunction({
          parameters: [
            {
              isRequired: false,
              name: 'options',
              type: `Partial<${typeData}>`,
            },
          ],
          statements: [
            compiler.constVariable({
              expression: compiler.objectExpression({
                obj: [
                  {
                    key: 'mutationFn',
                    value: compiler.arrowFunction({
                      async: true,
                      multiLine: true,
                      parameters: [
                        {
                          name: 'localOptions',
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
                                      spread: 'localOptions',
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
                          expression: 'data',
                        }),
                      ],
                    }),
                  },
                ],
              }),
              name: mutationOptionsFn,
              // TODO: better types syntax
              typeName: `${mutationsType}<${typeResponse}, ${typeError.name}, ${typeData}>`,
            }),
            compiler.returnVariable({
              expression: mutationOptionsFn,
            }),
          ],
        });
        const statement = compiler.constVariable({
          // TODO: describe options, same as the actual function call
          comment: [],
          exportConst: true,
          expression,
          name: mutationOptionsFunctionIdentifier({ context, operation }),
        });
        file.add(statement);
      }

      const servicesModulePath = relativeModulePath({
        moduleOutput: context.file({ id: 'services' })!.nameWithoutExtension(),
        sourceOutput: plugin.output,
      });

      if (hasQueries || hasInfiniteQueries) {
        file.import({
          module: servicesModulePath,
          name: 'client',
        });
      }

      if (hasUsedQueryFn) {
        file.import({
          module: servicesModulePath,
          name: queryFn.split('.')[0],
        });
      }
    }
  }
};
