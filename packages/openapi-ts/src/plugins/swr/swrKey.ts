import type { Symbol } from '@hey-api/codegen-core';

import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { tsc } from '~/tsc';

import type { PluginInstance } from './types';
import { useTypeData } from './useType';

/**
 * Generate a SWR key statement for a given operation.
 *
 * For SWR, keys are structured to include only relevant fields (path, query, body)
 * to ensure stable caching behavior.
 *
 * Example output:
 * export const getUserByIdKey = (options: GetUserByIdOptions) => {
 *   const key: any[] = ['/api/users/{id}'];
 *   if (options?.path) key.push({ path: options.path });
 *   if (options?.query) key.push({ query: options.query });
 *   return key;
 * }
 */
export const swrKeyStatement = ({
  operation,
  plugin,
  symbol,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
  symbol: Symbol;
}) => {
  const typeData = useTypeData({ operation, plugin });

  // Build statements that conditionally add relevant fields to the key
  const statements: Array<any> = [];

  // Initialize key array with the operation path as identifier
  statements.push(
    tsc.constVariable({
      expression: tsc.arrayLiteralExpression({
        elements: [tsc.stringLiteral({ text: operation.path })],
      }),
      name: 'key',
      typeName: tsc.typeReferenceNode({ typeName: 'any[]' }),
    }),
  );

  // Add path parameters if they exist
  statements.push(
    tsc.ifStatement({
      expression: tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        isOptional: true,
        name: tsc.identifier({ text: 'path' }),
      }),
      thenStatement: tsc.block({
        statements: [
          tsc.expressionToStatement({
            expression: tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: 'key',
                name: 'push',
              }),
              parameters: [
                tsc.objectExpression({
                  multiLine: false,
                  obj: [
                    {
                      key: 'path',
                      value: tsc.propertyAccessExpression({
                        expression: 'options',
                        name: 'path',
                      }),
                    },
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    }),
  );

  // Add query parameters if they exist
  statements.push(
    tsc.ifStatement({
      expression: tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        isOptional: true,
        name: tsc.identifier({ text: 'query' }),
      }),
      thenStatement: tsc.block({
        statements: [
          tsc.expressionToStatement({
            expression: tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: 'key',
                name: 'push',
              }),
              parameters: [
                tsc.objectExpression({
                  multiLine: false,
                  obj: [
                    {
                      key: 'query',
                      value: tsc.propertyAccessExpression({
                        expression: 'options',
                        name: 'query',
                      }),
                    },
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    }),
  );

  // Add body if it exists
  statements.push(
    tsc.ifStatement({
      expression: tsc.propertyAccessExpression({
        expression: tsc.identifier({ text: 'options' }),
        isOptional: true,
        name: tsc.identifier({ text: 'body' }),
      }),
      thenStatement: tsc.block({
        statements: [
          tsc.expressionToStatement({
            expression: tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: 'key',
                name: 'push',
              }),
              parameters: [
                tsc.objectExpression({
                  multiLine: false,
                  obj: [
                    {
                      key: 'body',
                      value: tsc.propertyAccessExpression({
                        expression: 'options',
                        name: 'body',
                      }),
                    },
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    }),
  );

  // Return the key array
  statements.push(
    tsc.returnStatement({
      expression: tsc.identifier({ text: 'key' }),
    }),
  );

  const statement = tsc.constVariable({
    exportConst: symbol.exported,
    expression: tsc.arrowFunction({
      multiLine: true,
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: typeData,
        },
      ],
      statements,
    }),
    name: symbol.placeholder,
  });

  return statement;
};

/**
 * Register a SWR key symbol for a given operation.
 */
export const registerSwrKey = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): Symbol => {
  const symbol = plugin.registerSymbol({
    exported: true,
    name: buildName({
      config: plugin.config.swrKeys,
      name: operation.id,
    }),
  });

  const node = swrKeyStatement({
    operation,
    plugin,
    symbol,
  });

  plugin.setSymbolValue(symbol, node);

  return symbol;
};
