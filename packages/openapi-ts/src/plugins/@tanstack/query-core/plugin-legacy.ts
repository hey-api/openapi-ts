import ts from 'typescript';

import { clientModulePath } from '../../../generate/client';
import { relativeModulePath } from '../../../generate/utils';
import { createOperationKey } from '../../../ir/operation';
import { getPaginationKeywordsRegExp } from '../../../ir/pagination';
import type { IR } from '../../../ir/types';
import { isOperationParameterRequired } from '../../../openApi';
import { type Property, tsc } from '../../../tsc';
import type { ImportExportItem } from '../../../tsc/module';
import type { ImportExportItemObject } from '../../../tsc/utils';
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
import { transformClassName } from '../../../utils/transform';
import {
  getClientBaseUrlKey,
  getClientPlugin,
} from '../../@hey-api/client-core/utils';
import {
  generateImport,
  operationDataTypeName,
  operationErrorTypeName,
  operationOptionsLegacyParserType,
  operationResponseTypeName,
  serviceFunctionIdentifier,
} from '../../@hey-api/sdk/plugin-legacy';
import type { TanStackAngularQueryPlugin } from '../angular-query-experimental';
import type { TanStackReactQueryPlugin } from '../react-query';
import type { TanStackSolidQueryPlugin } from '../solid-query';
import type { TanStackSvelteQueryPlugin } from '../svelte-query';
import type { TanStackVueQueryPlugin } from '../vue-query';

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

const createInfiniteParamsFunction = ({
  file,
}: {
  file: Files[keyof Files];
}) => {
  const fn = tsc.constVariable({
    expression: tsc.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: tsc.typeNode('QueryKey<OptionsLegacyParser>'),
        },
        {
          name: 'page',
          type: tsc.typeNode('K'),
        },
      ],
      statements: [
        tsc.constVariable({
          expression: tsc.identifier({
            text: 'queryKey[0]',
          }),
          name: 'params',
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
            name: tsc.identifier({ text: 'body' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'body',
                  }),
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
            name: tsc.identifier({ text: 'headers' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'headers',
                  }),
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
            name: tsc.identifier({ text: 'path' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'path',
                  }),
                  right: tsc.objectExpression({
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
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({
              text: 'page',
            }),
            name: tsc.identifier({ text: 'query' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'query',
                  }),
                  right: tsc.objectExpression({
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
        tsc.returnVariable({
          expression: ts.factory.createAsExpression(
            ts.factory.createAsExpression(
              tsc.identifier({ text: 'params' }),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ),
            ts.factory.createTypeQueryNode(tsc.identifier({ text: 'page' })),
          ),
        }),
      ],
      types: [
        {
          extends: tsc.typeReferenceNode({
            typeName: tsc.identifier({
              text: "Pick<QueryKey<OptionsLegacyParser>[0], 'body' | 'headers' | 'path' | 'query'>",
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
  const returnType = tsc.indexedAccessTypeNode({
    indexType: tsc.typeNode(0),
    objectType: tsc.typeNode(queryKeyName, [tsc.typeNode(TOptionsType)]),
  });

  const infiniteIdentifier = tsc.identifier({ text: 'infinite' });
  const baseUrlKey = getClientBaseUrlKey(getConfig());

  const fn = tsc.constVariable({
    expression: tsc.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'id',
          type: tsc.typeNode('string'),
        },
        {
          isRequired: false,
          name: 'options',
          type: tsc.typeNode(TOptionsType),
        },
        {
          isRequired: false,
          name: 'infinite',
          type: tsc.typeNode('boolean'),
        },
      ],
      returnType,
      statements: [
        tsc.constVariable({
          assertion: returnType,
          expression: tsc.objectExpression({
            multiLine: false,
            obj: [
              {
                key: '_id',
                value: tsc.identifier({ text: 'id' }),
              },
              {
                key: baseUrlKey,
                value: tsc.identifier({
                  text: `options?.${baseUrlKey} || (options?.client ?? _heyApiClient).getConfig().${baseUrlKey}`,
                }),
              },
            ],
          }),
          name: 'params',
          typeName: returnType,
        }),
        tsc.ifStatement({
          expression: infiniteIdentifier,
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: '_infinite',
                  }),
                  right: infiniteIdentifier,
                }),
              }),
            ],
          }),
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            isOptional: true,
            name: tsc.identifier({ text: 'body' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'body',
                  }),
                  right: tsc.propertyAccessExpression({
                    expression: 'options',
                    name: 'body',
                  }),
                }),
              }),
            ],
          }),
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            isOptional: true,
            name: tsc.identifier({ text: 'headers' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'headers',
                  }),
                  right: tsc.propertyAccessExpression({
                    expression: 'options',
                    name: 'headers',
                  }),
                }),
              }),
            ],
          }),
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            isOptional: true,
            name: tsc.identifier({ text: 'path' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'path',
                  }),
                  right: tsc.propertyAccessExpression({
                    expression: 'options',
                    name: 'path',
                  }),
                }),
              }),
            ],
          }),
        }),
        tsc.ifStatement({
          expression: tsc.propertyAccessExpression({
            expression: tsc.identifier({ text: 'options' }),
            isOptional: true,
            name: tsc.identifier({ text: 'query' }),
          }),
          thenStatement: tsc.block({
            statements: [
              tsc.expressionToStatement({
                expression: tsc.binaryExpression({
                  left: tsc.propertyAccessExpression({
                    expression: 'params',
                    name: 'query',
                  }),
                  right: tsc.propertyAccessExpression({
                    expression: 'options',
                    name: 'query',
                  }),
                }),
              }),
            ],
          }),
        }),
        tsc.returnVariable({
          expression: 'params',
        }),
      ],
      types: [
        {
          extends: tsc.typeReferenceNode({
            typeName: tsc.identifier({ text: 'OptionsLegacyParser' }),
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
      type: tsc.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: tsc.keywordTypeNode({
        keyword: 'boolean',
      }),
    },
  ];

  const queryKeyType = tsc.typeAliasDeclaration({
    name: queryKeyName,
    type: tsc.typeTupleNode({
      types: [
        tsc.typeIntersectionNode({
          types: [
            tsc.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey(getConfig())}' | 'body' | 'headers' | 'path' | 'query'>`,
            }),
            tsc.typeInterfaceNode({
              properties,
              useLegacyResolution: true,
            }),
          ],
        }),
      ],
    }),
    typeParameters: [
      {
        extends: tsc.typeReferenceNode({
          typeName: tsc.identifier({ text: 'OptionsLegacyParser' }),
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

  const clientPlugin = getClientPlugin(config);
  if (clientPlugin.name === '@hey-api/client-axios') {
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
  const queryKeyLiteral = tsc.arrayLiteralExpression({
    elements: [
      tsc.callExpression({
        functionName: createQueryKeyFn,
        parameters: [
          tsc.ots.string(id),
          'options',
          isInfinite ? tsc.ots.boolean(true) : undefined,
        ],
      }),
    ],
    multiLine: false,
  });
  return queryKeyLiteral;
};

export const handlerLegacy = ({
  client,
  files,
  plugin,
}: Parameters<
  | TanStackAngularQueryPlugin['LegacyHandler']
  | TanStackReactQueryPlugin['LegacyHandler']
  | TanStackSolidQueryPlugin['LegacyHandler']
  | TanStackSvelteQueryPlugin['LegacyHandler']
  | TanStackVueQueryPlugin['LegacyHandler']
>[0]) => {
  const config = getConfig();

  if (isLegacyClient(config)) {
    throw new Error('TanStack Query plugin does not support legacy clients');
  }

  const file = files[plugin.name]!;

  file.import({
    asType: true,
    module: clientModulePath({ config, sourceOutput: plugin.output }),
    name: 'OptionsLegacyParser',
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
      const operationKey = createOperationKey(operation);
      if (processedOperations.has(operationKey)) {
        continue;
      }
      processedOperations.set(operationKey, true);

      const queryFn = [
        config.plugins['@hey-api/sdk']?.config.asClass &&
          transformClassName({
            config,
            name: service.name,
          }),
        serviceFunctionIdentifier({
          config,
          handleIllegal: !config.plugins['@hey-api/sdk']?.config.asClass,
          id: operation.name,
          operation,
        }),
      ]
        .filter(Boolean)
        .join('.');
      let hasUsedQueryFn = false;

      // queries
      if (
        plugin.config.queryOptions.enabled &&
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

        const queryKeyStatement = tsc.constVariable({
          exportConst: true,
          expression: tsc.arrowFunction({
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

        const statement = tsc.constVariable({
          // TODO: describe options, same as the actual function call
          comment: [],
          exportConst: true,
          expression: tsc.arrowFunction({
            parameters: [
              {
                isRequired,
                name: 'options',
                type: typeData,
              },
            ],
            statements: [
              tsc.returnFunctionCall({
                args: [
                  tsc.objectExpression({
                    obj: [
                      {
                        key: 'queryFn',
                        value: tsc.arrowFunction({
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
                            tsc.constVariable({
                              destructure: true,
                              expression: tsc.awaitExpression({
                                expression: tsc.callExpression({
                                  functionName: queryFn,
                                  parameters: [
                                    tsc.objectExpression({
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
                                          value: tsc.identifier({
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
                            tsc.returnVariable({
                              expression: 'data',
                            }),
                          ],
                        }),
                      },
                      {
                        key: 'queryKey',
                        value: tsc.callExpression({
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
        plugin.config.infiniteQueryOptions &&
        (['GET', 'POST'] as ReadonlyArray<Method>).includes(operation.method)
      ) {
        // the actual pagination field might be nested inside parameter, e.g. body
        let paginationField!: Model | OperationParameter;

        const paginationParameter = operation.parameters.find((parameter) => {
          const paginationRegExp = getPaginationKeywordsRegExp(
            config.parser.pagination,
          );
          if (paginationRegExp.test(parameter.name)) {
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
              const paginationRegExp = getPaginationKeywordsRegExp(
                config.parser.pagination,
              );
              if (paginationRegExp.test(property.name)) {
                paginationField = property;
                return true;
              }
              return;
            });
          }

          return parameter.properties.find((property) => {
            const paginationRegExp = getPaginationKeywordsRegExp(
              config.parser.pagination,
            );
            if (paginationRegExp.test(property.name)) {
              paginationField = property;
              return true;
            }
            return;
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

          const queryKeyStatement = tsc.constVariable({
            exportConst: true,
            expression: tsc.arrowFunction({
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

          const statement = tsc.constVariable({
            // TODO: describe options, same as the actual function call
            comment: [],
            exportConst: true,
            expression: tsc.arrowFunction({
              parameters: [
                {
                  isRequired,
                  name: 'options',
                  type: typeData,
                },
              ],
              statements: [
                tsc.returnFunctionCall({
                  args: [
                    tsc.objectExpression({
                      comments: [
                        {
                          jsdoc: false,
                          lines: ['@ts-ignore'],
                        },
                      ],
                      obj: [
                        {
                          key: 'queryFn',
                          value: tsc.arrowFunction({
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
                              tsc.constVariable({
                                comment: [
                                  {
                                    jsdoc: false,
                                    lines: ['@ts-ignore'],
                                  },
                                ],
                                expression: tsc.conditionalExpression({
                                  condition: tsc.binaryExpression({
                                    left: tsc.typeOfExpression({
                                      text: 'pageParam',
                                    }),
                                    operator: '===',
                                    right: tsc.ots.string('object'),
                                  }),
                                  whenFalse: tsc.objectExpression({
                                    multiLine: true,
                                    obj: [
                                      {
                                        key: getPaginationIn(
                                          paginationParameter,
                                        ),
                                        value: tsc.objectExpression({
                                          multiLine: true,
                                          obj: [
                                            {
                                              key: paginationField.name,
                                              value: tsc.identifier({
                                                text: 'pageParam',
                                              }),
                                            },
                                          ],
                                        }),
                                      },
                                    ],
                                  }),
                                  whenTrue: tsc.identifier({
                                    text: 'pageParam',
                                  }),
                                }),
                                name: 'page',
                                typeName: typePageObjectParam,
                              }),
                              tsc.constVariable({
                                expression: tsc.callExpression({
                                  functionName: 'createInfiniteParams',
                                  parameters: ['queryKey', 'page'],
                                }),
                                name: 'params',
                              }),
                              tsc.constVariable({
                                destructure: true,
                                expression: tsc.awaitExpression({
                                  expression: tsc.callExpression({
                                    functionName: queryFn,
                                    parameters: [
                                      tsc.objectExpression({
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
                                            value: tsc.identifier({
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
                              tsc.returnVariable({
                                expression: 'data',
                              }),
                            ],
                          }),
                        },
                        {
                          key: 'queryKey',
                          value: tsc.callExpression({
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
                    typeError.name!,
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
        plugin.config.mutationOptions &&
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

        const fnOptions = 'fnOptions';

        const expression = tsc.arrowFunction({
          parameters: [
            {
              isRequired: false,
              name: 'options',
              type: `Partial<${typeData}>`,
            },
          ],
          statements: [
            tsc.constVariable({
              expression: tsc.objectExpression({
                obj: [
                  {
                    key: 'mutationFn',
                    value: tsc.arrowFunction({
                      async: true,
                      multiLine: true,
                      parameters: [
                        {
                          name: fnOptions,
                        },
                      ],
                      statements: [
                        tsc.constVariable({
                          destructure: true,
                          expression: tsc.awaitExpression({
                            expression: tsc.callExpression({
                              functionName: queryFn,
                              parameters: [
                                tsc.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      spread: 'options',
                                    },
                                    {
                                      spread: fnOptions,
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
                        tsc.returnVariable({
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
            tsc.returnVariable({
              expression: mutationOptionsFn,
            }),
          ],
        });
        const statement = tsc.constVariable({
          // TODO: describe options, same as the actual function call
          comment: [],
          exportConst: true,
          expression,
          name: toMutationOptionsName(operation),
        });
        file.add(statement);
      }

      if (hasQueries || hasInfiniteQueries) {
        file.import({
          alias: '_heyApiClient',
          module: relativeModulePath({
            moduleOutput: files.client!.nameWithoutExtension(),
            sourceOutput: plugin.output,
          }),
          name: 'client',
        });
      }

      if (hasUsedQueryFn) {
        file.import({
          module: relativeModulePath({
            moduleOutput: files.sdk!.nameWithoutExtension(),
            sourceOutput: plugin.output,
          }),
          name: queryFn.split('.')[0]!,
        });
      }
    }
  }
};
