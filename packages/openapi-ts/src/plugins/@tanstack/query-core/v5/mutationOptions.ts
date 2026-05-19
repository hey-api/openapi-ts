import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
} from '../../../../plugins/shared/utils/operation';
import type { TsDsl } from '../../../../ts-dsl';
import { $ } from '../../../../ts-dsl';
import {
  createMutationKeyFunction,
  createMutationKeyType,
  mutationKeyStatement,
} from '../mutationKey';
import { handleMeta } from '../shared/meta';
import {
  ensureFieldsResponseTypes,
  fieldsStyleParamName,
  fieldsStyleUnion,
  parenExpr,
} from '../shared/responseTypes';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

export function createMutationOptions({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void {
  if (hasOperationSse({ operation })) return;

  if (
    plugin.config.mutationKeys.enabled &&
    !plugin.querySymbol({
      category: 'utility',
      resource: 'createMutationKey',
      tool: plugin.name,
    })
  ) {
    createMutationKeyType({ plugin });
    createMutationKeyFunction({ plugin });
  }

  const symbolMutationOptionsType = plugin.external(`${plugin.name}.MutationOptions`);

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });

  const isFields = plugin.config.responseStyle === 'fields';

  const fieldsTypes = isFields ? ensureFieldsResponseTypes(plugin) : undefined;
  const wrappedResponse = fieldsTypes
    ? $.type(fieldsTypes.symbolResponseResult).generic(typeResponse).generic(fieldsStyleParamName)
    : typeResponse;
  const wrappedError = fieldsTypes
    ? $.type(fieldsTypes.symbolResponseError).generic(typeError).generic(fieldsStyleParamName)
    : typeError;

  const mutationType = $.type(symbolMutationOptionsType)
    .generic(wrappedResponse)
    .generic(wrappedError)
    .generic(typeData);

  const fnOptions = 'fnOptions';

  const sdkCallObject = isFields
    ? $.object()
        .spread('options')
        .spread(fnOptions)
        .prop('responseStyle', $.literal('fields'))
        .prop('throwOnError', $.literal(false))
    : $.object().spread('options').spread(fnOptions).prop('throwOnError', $.literal(true));

  const awaitSdkFn = $.lazy((ctx) =>
    ctx
      .access(
        plugin.referenceSymbol({
          category: 'sdk',
          resource: 'operation',
          resourceId: operation.id,
        }),
      )
      .call(sdkCallObject)
      .await(),
  );

  const statements: Array<TsDsl<any>> = [];
  if (isFields) {
    const isFieldsCall = $('options').attr('responseStyle').optional().eq($.literal('fields'));
    const errorFieldsObject = $.object()
      .pretty()
      .prop('error', $('result').attr('error'))
      .prop('request', $('result').attr('request'))
      .prop('response', $('result').attr('response'));
    const dataFieldsObject = $.object()
      .pretty()
      .prop('data', $('result').attr('data'))
      .prop('request', $('result').attr('request'))
      .prop('response', $('result').attr('response'));
    statements.push(
      $.const('result').assign(awaitSdkFn),
      $.if($('result').attr('error').neq($('undefined'))).do(
        $.throw(
          $.as(
            parenExpr(
              $.ternary(isFieldsCall).do(errorFieldsObject).otherwise($('result').attr('error')),
            ),
            wrappedError,
          ),
          false,
        ),
      ),
      $.return(
        $.as(
          parenExpr(
            $.ternary(isFieldsCall).do(dataFieldsObject).otherwise($('result').attr('data')),
          ),
          wrappedResponse,
        ),
      ),
    );
  } else if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
    statements.push($.return(awaitSdkFn));
  } else {
    statements.push($.const().object('data').assign(awaitSdkFn), $.return('data'));
  }

  let symbolMutationKey: Symbol | undefined;
  if (plugin.config.mutationKeys.enabled) {
    symbolMutationKey = plugin.symbol(applyNaming(operation.id, plugin.config.mutationKeys));
    const node = mutationKeyStatement({
      operation,
      plugin,
      symbol: symbolMutationKey,
    });
    plugin.node(node);
  }

  const mutationOptionsFn = 'mutationOptions';
  const symbolMutationOptions = plugin.symbol(
    applyNaming(operation.id, plugin.config.mutationOptions),
    {
      meta: {
        category: 'hook',
        resource: 'operation',
        resourceId: operation.id,
        role: 'mutationOptions',
        tool: plugin.name,
      },
    },
  );
  const statement = $.const(symbolMutationOptions)
    .export(plugin.config.mutationOptions.exported)
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func()
        .$if(isFields, (f) =>
          f.generic(fieldsStyleParamName, (g) =>
            g.extends(fieldsStyleUnion()).default($.type.literal('fields')),
          ),
        )
        .param('options', (p) => {
          const partialOptions = $.type('Partial').generic(typeData);
          const optionsType = isFields
            ? $.type.and(
                partialOptions,
                $.type
                  .object()
                  .prop('responseStyle', (op) => op.type(fieldsStyleParamName).optional()),
              )
            : partialOptions;
          return p.optional().type(optionsType);
        })
        .returns(mutationType)
        .do(
          $.const(mutationOptionsFn)
            .type(mutationType)
            .assign(
              $.object()
                .pretty()
                .prop(
                  'mutationFn',
                  $.func()
                    .async()
                    .param(fnOptions)
                    .do(...statements),
                )
                .$if(symbolMutationKey, (c, v) => c.prop('mutationKey', $(v).call('options')))
                .$if(handleMeta(plugin, operation, 'mutationOptions'), (c, v) => c.prop('meta', v)),
            ),
          $(mutationOptionsFn).return(),
        ),
    );
  plugin.node(statement);
}
