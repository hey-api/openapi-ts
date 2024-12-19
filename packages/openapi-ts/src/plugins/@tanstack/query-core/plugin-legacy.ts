import ts from 'typescript';

import { compiler, type Property } from '../../../compiler';
import type { ImportExportItem } from '../../../compiler/module';
import type { ImportExportItemObject } from '../../../compiler/utils';
import { clientApi, clientModulePath } from '../../../generate/client';
import { relativeModulePath } from '../../../generate/utils';
import { paginationKeywordsRegExp } from '../../../ir/pagination';
import type { IR } from '../../../ir/types';
import { isOperationParameterRequired } from '../../../openApi';
import { getOperationKey } from '../../../openApi/common/parser/operation';
import type {
  Client,
  Method,
  Model,
  Operation,
  OperationParameter,
} from '../../../types/client';
import type { Config } from '../../../types/config';
import type { Files } from '../../../types/utils';
import { getConfig, isLegacyClient } from '../../../utils/config';
import { transformServiceName } from '../../../utils/transform';
import {
  generateImport,
  operationDataTypeName,
  operationErrorTypeName,
  operationOptionsLegacyParserType,
  operationResponseTypeName,
  serviceFunctionIdentifier,
} from '../../@hey-api/sdk/plugin-legacy';
import type { Plugin } from '../../types';
import type { Config as AngularQueryConfig } from '../angular-query-experimental';
import type { Config as ReactQueryConfig } from '../react-query';
import type { Config as SolidQueryConfig } from '../solid-query';
import type { Config as SvelteQueryConfig } from '../svelte-query';
import type { Config as VueQueryConfig } from '../vue-query';

const toInfiniteQueryOptionsName = (operation: Operation) =>
  `${serviceFunctionIdentifier({
    config: getConfig(),
    id: operation.name,
    operation,
  })}InfiniteOptions`;

const toMutationOptionsName = (operation: Operation) =>
  `${serviceFunctionIdentifier({
    config: getConfig(),
    id: operation.name,
    operation,
  })}Mutation`;

const toQueryOptionsName = ({
  config,
  id,
  operation,
}: {
  config: Config;
  id: string;
  operation: IR.OperationObject | Operation;
}) =>
  `${serviceFunctionIdentifier({
    config,
    id,
    operation,
  })}Options`;

const toQueryKeyName = ({
  config,
  id,
  isInfinite,
  operation,
}: {
  config: Config;
  id: string;
  isInfinite?: boolean;
  operation: IR.OperationObject | Operation;
}) =>
  `${serviceFunctionIdentifier({
    config,
    id,
    operation,
  })}${isInfinite ? 'Infinite' : ''}QueryKey`;

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
          type: compiler.typeNode(
            `QueryKey<${clientApi.OptionsLegacyParser.name}>`,
          ),
        },
        {
          name: 'page',
          type: compiler.typeNode('K'),
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
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'headers' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'path' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'query' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
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
              text: `Pick<QueryKey<${clientApi.OptionsLegacyParser.name}>[0], 'body' | 'headers' | 'path' | 'query'>`,
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
    indexType: compiler.typeNode(0),
    objectType: compiler.typeNode(queryKeyName, [
      compiler.typeNode(TOptionsType),
    ]),
  });

  const infiniteIdentifier = compiler.identifier({ text: 'infinite' });

  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'id',
          type: compiler.typeNode('string'),
        },
        {
          isRequired: false,
          name: 'options',
          type: compiler.typeNode(TOptionsType),
        },
        {
          isRequired: false,
          name: 'infinite',
          type: compiler.typeNode('boolean'),
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
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'body' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'headers' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'path' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'query' }),
          }),
          thenStatement: compiler.block({
            statements: [
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
          }),
        }),
        compiler.returnVariable({
          expression: 'params',
        }),
      ],
      types: [
        {
          extends: compiler.typeReferenceNode({
            typeName: compiler.identifier({
              text: clientApi.OptionsLegacyParser.name,
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
            text: clientApi.OptionsLegacyParser.name,
          }),
        }),
        name: TOptionsType,
      },
    ],
  });
  file.add(queryKeyType);
};

const createTypeData = ({
  client,
  file,
  operation,
  typesModulePath,
}: {
  client: Client;
  file: Files[keyof Files];
  operation: Operation;
  typesModulePath: string;
}) => {
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

  const typeData = operationOptionsLegacyParserType({
    importedType: nameTypeData,
  });

  return { typeData };
};

const createTypeError = ({
  client,
  file,
  operation,
  pluginName,
  typesModulePath,
}: {
  client: Client;
  file: Files[keyof Files];
  operation: Operation;
  pluginName: string;
  typesModulePath: string;
}) => {
  const config = getConfig();

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
      module: pluginName,
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

const createTypeResponse = ({
  client,
  file,
  operation,
  typesModulePath,
}: {
  client: Client;
  file: Files[keyof Files];
  operation: Operation;
  typesModulePath: string;
}) => {
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

const createQueryKeyLiteral = ({
  id,
  isInfinite,
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

export const handlerLegacy: Plugin.LegacyHandler<
  | ReactQueryConfig
  | AngularQueryConfig
  | SolidQueryConfig
  | SvelteQueryConfig
  | VueQueryConfig
> = ({ client, files, plugin }) => {
  const config = getConfig();

  if (isLegacyClient(config)) {
    throw new Error('🚫 TanStack Query plugin does not support legacy clients');
  }

  const file = files[plugin.name]!;

  file.import({
    ...clientApi.OptionsLegacyParser,
    module: clientModulePath({ config, sourceOutput: plugin.output }),
  });

  const typesModulePath = relativeModulePath({
    moduleOutput: files.types!.nameWithoutExtension(),
    sourceOutput: plugin.output,
  });

  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
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

  const processedOperations = new Map<string, boolean>();

  for (const service of client.services) {
    for (const operation of service.operations) {
      // track processed operations to avoid creating duplicates
      const operationKey = getOperationKey(operation);
      if (processedOperations.has(operationKey)) {
        continue;
      }
      processedOperations.set(operationKey, true);

      const queryFn = [
        config.plugins['@hey-api/sdk']?.asClass &&
          transformServiceName({
            config,
            name: service.name,
          }),
        serviceFunctionIdentifier({
          config,
          handleIllegal: !config.plugins['@hey-api/sdk']?.asClass,
          id: operation.name,
          operation,
        }),
      ]
        .filter(Boolean)
        .join('.');
      let hasUsedQueryFn = false;

      // queries
      if (
        plugin.queryOptions &&
        (['GET', 'POST'] as ReadonlyArray<Method>).includes(operation.method)
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

        const { typeData } = createTypeData({
          client,
          file,
          operation,
          typesModulePath,
        });

        const isRequired = isOperationParameterRequired(operation.parameters);

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
              id: operation.name,
            }),
          }),
          name: toQueryKeyName({
            config,
            id: operation.name,
            operation,
          }),
        });
        file.add(queryKeyStatement);

        const statement = compiler.constVariable({
          // TODO: describe options, same as the actual function call
          comment: [],
          exportConst: true,
          expression: compiler.arrowFunction({
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
                                {
                                  name: 'signal',
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
                                          key: 'signal',
                                          shorthand: true,
                                          value: compiler.identifier({
                                            text: 'signal',
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
                              expression: 'data',
                            }),
                          ],
                        }),
                      },
                      {
                        key: 'queryKey',
                        value: compiler.callExpression({
                          functionName: toQueryKeyName({
                            config,
                            id: operation.name,
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
          }),
          name: toQueryOptionsName({
            config,
            id: operation.name,
            operation,
          }),
          // TODO: add type error
          // TODO: AxiosError<PutSubmissionMetaError>
        });
        file.add(statement);
      }

      // infinite queries
      if (
        plugin.infiniteQueryOptions &&
        (['GET', 'POST'] as ReadonlyArray<Method>).includes(operation.method)
      ) {
        // the actual pagination field might be nested inside parameter, e.g. body
        let paginationField!: Model | OperationParameter;

        const paginationParameter = operation.parameters.find((parameter) => {
          paginationKeywordsRegExp.lastIndex = 0;
          if (paginationKeywordsRegExp.test(parameter.name)) {
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
              paginationKeywordsRegExp.lastIndex = 0;
              if (paginationKeywordsRegExp.test(property.name)) {
                paginationField = property;
                return true;
              }
            });
          }

          return parameter.properties.find((property) => {
            paginationKeywordsRegExp.lastIndex = 0;
            if (paginationKeywordsRegExp.test(property.name)) {
              paginationField = property;
              return true;
            }
          });
        });

        if (paginationParameter && paginationField) {
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

          const { typeData } = createTypeData({
            client,
            file,
            operation,
            typesModulePath,
          });
          const { typeError } = createTypeError({
            client,
            file,
            operation,
            pluginName: plugin.name,
            typesModulePath,
          });
          const { typeResponse } = createTypeResponse({
            client,
            file,
            operation,
            typesModulePath,
          });

          const isRequired = isOperationParameterRequired(operation.parameters);

          const typeQueryKey = `${queryKeyName}<${typeData}>`;
          const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
          const typePageParam = `${paginationField.base} | ${typePageObjectParam}`;

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
                id: operation.name,
                isInfinite: true,
              }),
            }),
            name: toQueryKeyName({
              config,
              id: operation.name,
              isInfinite: true,
              operation,
            }),
          });
          file.add(queryKeyStatement);

          const statement = compiler.constVariable({
            // TODO: describe options, same as the actual function call
            comment: [],
            exportConst: true,
            expression: compiler.arrowFunction({
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
                                  {
                                    name: 'signal',
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
                                            key: 'signal',
                                            shorthand: true,
                                            value: compiler.identifier({
                                              text: 'signal',
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
                                expression: 'data',
                              }),
                            ],
                          }),
                        },
                        {
                          key: 'queryKey',
                          value: compiler.callExpression({
                            functionName: toQueryKeyName({
                              config,
                              id: operation.name,
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
            }),
            name: toInfiniteQueryOptionsName(operation),
          });
          file.add(statement);
        }
      }

      // mutations
      if (
        plugin.mutationOptions &&
        (['DELETE', 'PATCH', 'POST', 'PUT'] as ReadonlyArray<Method>).includes(
          operation.method,
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

        const { typeData } = createTypeData({
          client,
          file,
          operation,
          typesModulePath,
        });
        const { typeError } = createTypeError({
          client,
          file,
          operation,
          pluginName: plugin.name,
          typesModulePath,
        });
        const { typeResponse } = createTypeResponse({
          client,
          file,
          operation,
          typesModulePath,
        });

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
          name: toMutationOptionsName(operation),
        });
        file.add(statement);
      }

      const sdkModulePath = relativeModulePath({
        moduleOutput: files.sdk!.nameWithoutExtension(),
        sourceOutput: plugin.output,
      });

      if (hasQueries || hasInfiniteQueries) {
        file.import({
          module: sdkModulePath,
          name: 'client',
        });
      }

      if (hasUsedQueryFn) {
        file.import({
          module: sdkModulePath,
          name: queryFn.split('.')[0]!,
        });
      }
    }
  }
};
