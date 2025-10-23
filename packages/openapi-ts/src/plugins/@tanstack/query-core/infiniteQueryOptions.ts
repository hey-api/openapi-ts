import ts from 'typescript';

import { operationPagination } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { isOperationOptionsRequired } from '~/plugins/shared/utils/operation';
import { tsc } from '~/tsc';
import { tsNodeToString } from '~/tsc/utils';

import { handleMeta } from './meta';
import {
  createQueryKeyFunction,
  createQueryKeyType,
  queryKeyStatement,
} from './queryKey';
import type { PluginInstance } from './types';
import { useTypeData, useTypeError, useTypeResponse } from './useType';

const createInfiniteParamsFunction = ({
  plugin,
}: {
  plugin: PluginInstance;
}) => {
  const symbolCreateInfiniteParams = plugin.registerSymbol({
    name: buildName({
      config: {
        case: plugin.config.case,
      },
      name: 'createInfiniteParams',
    }),
    selector: plugin.api.selector('createInfiniteParams'),
  });

  const fn = tsc.constVariable({
    expression: tsc.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: tsc.typeReferenceNode({ typeName: 'QueryKey<Options>' }),
        },
        {
          name: 'page',
          type: tsc.typeReferenceNode({ typeName: 'K' }),
        },
      ],
      statements: [
        tsc.constVariable({
          expression: tsc.objectExpression({
            obj: [
              {
                spread: tsc.propertyAccessExpression({
                  expression: 'queryKey',
                  name: 0,
                }),
              },
            ],
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
                        assertion: 'any',
                        spread: 'queryKey[0].path',
                      },
                      {
                        assertion: 'any',
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
                        assertion: 'any',
                        spread: 'queryKey[0].query',
                      },
                      {
                        assertion: 'any',
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
          expression: tsc.asExpression({
            expression: tsc.asExpression({
              expression: tsc.identifier({ text: 'params' }),
              type: tsc.keywordTypeNode({ keyword: 'unknown' }),
            }),
            type: ts.factory.createTypeQueryNode(
              tsc.identifier({ text: 'page' }),
            ),
          }),
        }),
      ],
      types: [
        {
          extends: tsc.typeReferenceNode({
            typeName: tsc.identifier({
              text: "Pick<QueryKey<Options>[0], 'body' | 'headers' | 'path' | 'query'>",
            }),
          }),
          name: 'K',
        },
      ],
    }),
    name: symbolCreateInfiniteParams.placeholder,
  });
  plugin.setSymbolValue(symbolCreateInfiniteParams, fn);
};

export const createInfiniteQueryOptions = ({
  operation,
  plugin,
  queryFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  queryFn: string;
}): void => {
  const pagination = operationPagination({
    context: plugin.context,
    operation,
  });

  if (!pagination) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (!plugin.getSymbol(plugin.api.selector('createQueryKey'))) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  if (!plugin.getSymbol(plugin.api.selector('createInfiniteParams'))) {
    createInfiniteParamsFunction({ plugin });
  }

  const symbolInfiniteQueryOptions = plugin.referenceSymbol(
    plugin.api.selector('infiniteQueryOptions'),
  );
  const symbolInfiniteDataType = plugin.referenceSymbol(
    plugin.api.selector('InfiniteData'),
  );

  const typeData = useTypeData({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });

  const symbolQueryKeyType = plugin.referenceSymbol(
    plugin.api.selector('QueryKey'),
  );
  const typeQueryKey = `${symbolQueryKeyType.placeholder}<${typeData}>`;
  const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
  const pluginTypeScript = plugin.getPluginOrThrow('@hey-api/typescript');
  // TODO: parser - this is a bit clunky, need to compile type to string because
  // `tsc.returnFunctionCall()` accepts only strings, should be cleaned up
  const type = pluginTypeScript.api.schemaToType({
    plugin: pluginTypeScript,
    schema: pagination.schema,
  });
  const typePageParam = `${tsNodeToString({
    node: type,
    unescape: true,
  })} | ${typePageObjectParam}`;

  const symbolInfiniteQueryKey = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.infiniteQueryKeys,
      name: operation.id,
    }),
  });
  const node = queryKeyStatement({
    isInfinite: true,
    operation,
    plugin,
    symbol: symbolInfiniteQueryKey,
    typeQueryKey,
  });
  plugin.setSymbolValue(symbolInfiniteQueryKey, node);

  const awaitSdkExpression = tsc.awaitExpression({
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
  });

  const symbolCreateInfiniteParams = plugin.referenceSymbol(
    plugin.api.selector('createInfiniteParams'),
  );

  const statements: Array<ts.Statement> = [
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
              key: pagination.in,
              value: tsc.objectExpression({
                multiLine: true,
                obj: [
                  {
                    key: pagination.name,
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
        functionName: symbolCreateInfiniteParams.placeholder,
        parameters: ['queryKey', 'page'],
      }),
      name: 'params',
    }),
  ];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push(
      tsc.returnVariable({
        expression: awaitSdkExpression,
      }),
    );
  } else {
    statements.push(
      tsc.constVariable({
        destructure: true,
        expression: awaitSdkExpression,
        name: 'data',
      }),
      tsc.returnVariable({
        expression: 'data',
      }),
    );
  }

  const infiniteQueryOptionsObj: Array<{ key: string; value: ts.Expression }> =
    [
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
          statements,
        }),
      },
      {
        key: 'queryKey',
        value: tsc.callExpression({
          functionName: symbolInfiniteQueryKey.placeholder,
          parameters: ['options'],
        }),
      },
    ];

  const meta = handleMeta(plugin, operation, 'infiniteQueryOptions');

  if (meta) {
    infiniteQueryOptionsObj.push({
      key: 'meta',
      value: meta,
    });
  }

  const sdkPlugin = plugin.getPluginOrThrow('@hey-api/sdk');

  const symbolInfiniteQueryOptionsFn = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.infiniteQueryOptions,
      name: operation.id,
    }),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? sdkPlugin.api.createOperationComment({ operation })
      : undefined,
    exportConst: symbolInfiniteQueryOptionsFn.exported,
    expression: tsc.arrowFunction({
      parameters: [
        {
          isRequired: isRequiredOptions,
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
              obj: infiniteQueryOptionsObj,
            }),
          ],
          name: symbolInfiniteQueryOptions.placeholder,
          // TODO: better types syntax
          types: [
            typeResponse,
            typeError || 'unknown',
            `${symbolInfiniteDataType.placeholder}<${typeResponse}>`,
            typeQueryKey,
            typePageParam,
          ],
        }),
      ],
    }),
    name: symbolInfiniteQueryOptionsFn.placeholder,
  });
  plugin.setSymbolValue(symbolInfiniteQueryOptionsFn, statement);
};
