import ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { SwrPlugin } from '../types';
import { useTypeData } from '../useType';

const optionsParamName = 'options';

/**
 * Create useSWRMutation options for a given operation.
 *
 * This generates a function that returns an object with:
 * - key: The mutation key following SWR patterns (array with path + options object)
 * - fetcher: Async function that calls the SDK function with arg parameter
 *
 * Following SWR best practices with automatic object serialization (since SWR 1.1.0):
 * - No params: ['/api/users']
 * - With params: ['/api/users/{id}', options] (object serialized automatically)
 * - This matches the query key structure for proper cache integration
 *
 * Example outputs:
 * // No path parameters
 * export const createUserMutation = (options?: CreateUserOptions) => ({
 *   key: ['/api/users'],
 *   fetcher: async (_key, arg) => { ... },
 * });
 *
 * // With path parameters
 * export const deletePetMutation = (options?: DeletePetOptions) => ({
 *   key: ['/pet/{petId}', options],
 *   fetcher: async (_key, arg) => { ... },
 * });
 */
export const createSwrMutationOptions = ({
  operation,
  plugin,
  sdkFn,
}: {
  operation: IR.OperationObject;
  plugin: SwrPlugin['Instance'];
  sdkFn: string;
}): void => {
  const typeData = useTypeData({ operation, plugin });

  // Create the SDK function call with arg parameter
  const awaitSdkFn = $(sdkFn)
    .call(
      $.object()
        .spread(optionsParamName)
        .spread('arg')
        .prop('throwOnError', $.literal(true)),
    )
    .await();

  const statements: Array<TsDsl<any>> = [];

  if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push(
      $.const().object('data').assign(awaitSdkFn),
      $.return('data'),
    );
  }

  // Build mutation key following SWR patterns with object serialization
  // Since SWR 1.1.0+, we can pass options object directly in the array key
  const hasParams =
    (operation.parameters?.path &&
      Object.keys(operation.parameters.path).length > 0) ||
    (operation.parameters?.query &&
      Object.keys(operation.parameters.query).length > 0);

  let mutationKey: TsDsl<any>;
  let keyType: string;

  if (hasParams) {
    // With parameters: conditional key based on whether options is provided
    // options?.path ? [path, options] : [path]
    mutationKey = $(
      ts.factory.createConditionalExpression(
        ts.factory.createPropertyAccessChain(
          $('options').$render(),
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          'path',
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createArrayLiteralExpression([
          $.literal(operation.path).$render(),
          $('options').$render(),
        ]),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        ts.factory.createArrayLiteralExpression([
          $.literal(operation.path).$render(),
        ]),
      ),
    );
    keyType = `string[] | [string, ${typeData}]`;
  } else {
    // No parameters: simple array key [path]
    mutationKey = $(
      ts.factory.createArrayLiteralExpression([
        $.literal(operation.path).$render(),
      ]),
    );
    keyType = 'string[]';
  }

  // Build the options object
  const swrMutationOptionsObj = $.object()
    .pretty()
    .prop('key', mutationKey)
    .prop(
      'fetcher',
      $.func()
        .async()
        .param('_key', (p) => p.type(keyType))
        .param((p) =>
          p
            .object('arg')
            .type($.type.object().prop('arg', (p) => p.type(typeData))),
        )
        .do(...statements),
    );

  // Register the mutation options symbol
  const symbolSwrMutationOptionsFn = plugin.registerSymbol({
    exported: true,
    meta: {
      category: 'hook',
      resource: 'operation',
      resourceId: operation.id,
      role: 'swrMutationOptions',
      tool: plugin.name,
    },
    name: buildName({
      config: plugin.config.swrMutationOptions,
      name: operation.id,
    }),
  });

  const statement = $.const(symbolSwrMutationOptionsFn.placeholder)
    .export(symbolSwrMutationOptionsFn.exported)
    .$if(
      plugin.config.comments && createOperationComment({ operation }),
      (c, v) => c.doc(v as Array<string>),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) => p.optional(true).type(typeData))
        .do($.return(swrMutationOptionsObj)),
    );

  plugin.setSymbolValue(symbolSwrMutationOptionsFn, statement);
};
