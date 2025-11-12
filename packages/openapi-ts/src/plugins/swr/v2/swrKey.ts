import type { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import { hasOperationDataRequired } from '~/ir/operation';
import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { $ } from '~/ts-dsl';

import type { PluginInstance } from '../types';
import { useTypeData } from '../useType';

/**
 * Generate a SWR key statement for a given operation.
 *
 * For SWR, keys follow the official recommended pattern with primitive values:
 * - Simple cases: string key like '/api/user'
 * - With params: array key like ['/api/user', userId] with primitive values
 * - Conditional fetching: controlled by the consumer, not the key function
 *
 * This generates a function that always returns a valid key array.
 * Following SWR best practices: "use arrays with primitive values instead of objects"
 *
 * Example outputs:
 * - No params: ['/api/users']
 * - Single path param: ['/api/users', options.path.id]
 * - Multiple path params: ['/api/users', options.path.userId, options.path.orgId]
 * - Path + query: ['/api/users', options.path.id, options.query]
 * - Optional params: ['/api/users', options?.query] (uses optional chaining)
 *
 * Note: Conditional fetching should be controlled at the usage site:
 * useSWR(shouldFetch ? getKey(options) : null, fetcher)
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
  const isRequired = hasOperationDataRequired(operation);

  // Build the key based on what parameters exist
  // Following SWR's pattern: use primitive values for better serialization
  const pathParams = operation.parameters?.path || {};
  const hasQueryParams =
    operation.parameters?.query &&
    Object.keys(operation.parameters.query).length > 0;

  // Build array elements for the key using ts-dsl
  const baseKeyElements: ts.Expression[] = [
    $.literal(operation.path).$render(),
  ];

  // Extract each path parameter as a separate primitive value
  // This follows SWR best practice: ['/api/users', userId] not ['/api/users', { userId }]
  // Use parameter.name (the transformed TypeScript property name) not the key (original OpenAPI name)
  const pathKeyElements: ts.Expression[] = [];
  for (const key in pathParams) {
    const parameter = pathParams[key]!;
    pathKeyElements.push(
      $('options').attr('path').attr(parameter.name).$render(),
    );
  }

  // For query parameters, we keep them as an object since they can be complex
  // and are typically used together for filtering/pagination
  const queryKeyElement = hasQueryParams
    ? $('options').attr('query').$render()
    : null;

  // Determine the key expression based on whether parameters are required
  let keyExpression: ts.Expression;

  const hasParams = pathKeyElements.length > 0 || hasQueryParams;

  if (isRequired || !hasParams) {
    // If required OR no params at all, always return the full key array
    const allElements = [...baseKeyElements, ...pathKeyElements];
    if (queryKeyElement) {
      allElements.push(queryKeyElement);
    }
    keyExpression = ts.factory.createArrayLiteralExpression(allElements);
  } else {
    // If optional and has params, use optional chaining to safely access nested properties
    // Build the key array with optional chaining for safety
    const allElements = [...baseKeyElements];

    for (const key in pathParams) {
      const parameter = pathParams[key]!;
      allElements.push(
        ts.factory.createPropertyAccessChain(
          ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier('options'),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier('path'),
          ),
          undefined,
          ts.factory.createIdentifier(parameter.name),
        ),
      );
    }

    if (hasQueryParams) {
      allElements.push(
        ts.factory.createPropertyAccessChain(
          ts.factory.createIdentifier('options'),
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          ts.factory.createIdentifier('query'),
        ),
      );
    }

    keyExpression = ts.factory.createArrayLiteralExpression(allElements);
  }

  const statement = $.const(symbol.placeholder)
    .export(symbol.exported)
    .assign(
      $.func()
        .param('options', (p) => p.optional(!isRequired).type(typeData))
        .do($(keyExpression).return()),
    );

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
