import ts from 'typescript';

import type { IR } from '~/ir/types';
import { buildName } from '~/openApi/shared/utils/name';
import { createOperationComment } from '~/plugins/shared/utils/operation';
import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { PluginInstance } from '../types';
import { useTypeData } from '../useType';

const optionsParamName = 'options';

/**
 * Create useSWRMutation options for a given operation.
 *
 * This generates a function that returns an object with:
 * - key: The mutation key following SWR patterns (array with path + path params)
 * - fetcher: Async function that calls the SDK function with arg parameter
 *
 * Following SWR best practices:
 * - No path params: string key like '/api/users'
 * - With path params: array key like ['/api/users/{id}', userId]
 * - This matches the query key structure for proper cache integration
 *
 * Example outputs:
 * // No path parameters
 * export const createUserMutation = (options?: CreateUserOptions) => ({
 *   key: '/api/users',
 *   fetcher: async (_key, arg) => { ... },
 * });
 *
 * // With path parameters
 * export const deletePetMutation = (options?: DeletePetOptions) => ({
 *   key: options?.path ? ['/pet/{petId}', options.path.petId] : '/pet/{petId}',
 *   fetcher: async (_key, arg) => { ... },
 * });
 */
export const createSwrMutationOptions = ({
  operation,
  plugin,
  sdkFn,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
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

  // Build mutation key following SWR patterns
  // - If path params exist: use array [path, ...pathParams]
  // - If no path params: use simple string key
  const pathParams = operation.parameters?.path || {};
  const hasPathParams = Object.keys(pathParams).length > 0;

  let mutationKey: TsDsl<any>;
  let keyType: string;

  if (hasPathParams) {
    // Build array key: [path, param1, param2, ...]
    const keyElements: ts.Expression[] = [$.literal(operation.path).$render()];

    // Add each path parameter as a separate primitive value
    for (const key in pathParams) {
      const parameter = pathParams[key]!;
      keyElements.push(
        $('options').attr('path').attr(parameter.name).$render(),
      );
    }

    // Wrap in conditional: options?.path ? [...] : path
    mutationKey = $(
      ts.factory.createConditionalExpression(
        ts.factory.createPropertyAccessChain(
          $('options').$render(),
          ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
          'path',
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createArrayLiteralExpression(keyElements),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        $.literal(operation.path).$render(),
      ),
    );
    // Key type is either array or string depending on whether path params are provided
    keyType = 'string | readonly [string, ...Array<string | number>]';
  } else {
    // Simple string key for operations without path params
    mutationKey = $.literal(operation.path);
    keyType = 'string';
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
          p.object('arg').type(
            $.type.object((t) => {
              t.prop('arg', (p) => p.type(typeData));
            }),
          ),
        )
        .do(...statements),
    );

  // Register the mutation options symbol
  const symbolSwrMutationOptionsFn = plugin.registerSymbol({
    exported: plugin.config.swrMutationOptions.exported,
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
      (c, v) => c.describe(v as Array<string>),
    )
    .assign(
      $.func()
        .param(optionsParamName, (p) => p.optional(true).type(typeData))
        .do($.return(swrMutationOptionsObj)),
    );

  plugin.setSymbolValue(symbolSwrMutationOptionsFn, statement);
};
