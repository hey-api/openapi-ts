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
 * For SWR, keys follow the official recommended pattern using array keys with objects:
 * - Simple cases: ['/api/user'] (no params)
 * - With params: ['/api/user', options] (object serialized automatically since SWR 1.1.0)
 * - Conditional fetching: controlled by the consumer, not the key function
 *
 * This generates a function that always returns a valid key array.
 * Since SWR 1.1.0+, objects in array keys are automatically serialized.
 *
 * Example outputs:
 * - No params: ['/api/users']
 * - With params: ['/api/users/{id}', options] (SWR handles object serialization)
 * - Optional params: ['/api/users', options] (uses optional chaining for safety)
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

  // Build the key using array with path and options object
  // Since SWR 1.1.0+, objects in array keys are automatically serialized
  const hasParams =
    (operation.parameters?.path &&
      Object.keys(operation.parameters.path).length > 0) ||
    (operation.parameters?.query &&
      Object.keys(operation.parameters.query).length > 0);

  let keyExpression: ts.Expression;

  if (!hasParams) {
    // No parameters: just return ['/path']
    keyExpression = ts.factory.createArrayLiteralExpression([
      $.literal(operation.path).$render(),
    ]);
  } else if (isRequired) {
    // Required parameters: ['/path', options]
    keyExpression = ts.factory.createArrayLiteralExpression([
      $.literal(operation.path).$render(),
      $('options').$render(),
    ]);
  } else {
    // Optional parameters: ['/path', options] (with optional chaining for safety)
    keyExpression = ts.factory.createArrayLiteralExpression([
      $.literal(operation.path).$render(),
      $('options').$render(),
    ]);
  }

  const statement = $.const(symbol.placeholder)
    .export(symbol.exported)
    .assign(
      $.func()
        .param('options', (p) => p.optional(!isRequired).type(typeData))
        .do($(keyExpression).return()),
    );

  return statement.$render();
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
