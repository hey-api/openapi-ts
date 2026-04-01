import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
} from '../../../../plugins/shared/utils/operation';
import type { TsDsl } from '../../../../ts-dsl';
import { $ } from '../../../../ts-dsl';
import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

const TStyle = 'TStyle';
const styleUnion = () => $.type.or($.type.literal('data'), $.type.literal('fields'));

export const createMutationOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const symbolMutationOptionsType = plugin.external(`${plugin.name}.MutationOptions`);

  const typeData = useTypeData({ operation, plugin });
  const typeResponse = useTypeResponse({ operation, plugin });
  const typeError = useTypeError({ operation, plugin });

  if (plugin.config.responseStyle === 'fields') {
    // --- 'fields' code path: TStyle generic, ResponseResult/ResponseError wrappers ---
    // Default to 'data' so omitting responseStyle preserves backward-compatible behavior
    const defaultStyle = 'data' as const;

    const symbolResponseResult = plugin.referenceSymbol({
      category: 'type',
      resource: 'ResponseResult',
      tool: plugin.name,
    });
    const symbolResponseError = plugin.referenceSymbol({
      category: 'type',
      resource: 'ResponseError',
      tool: plugin.name,
    });

    const typeResponseResult = $.type(symbolResponseResult).generic(typeResponse).generic(TStyle);
    const typeResponseError = $.type(symbolResponseError).generic(typeError).generic(TStyle);

    const mutationType = $.type(symbolMutationOptionsType)
      .generic(typeResponseResult)
      .generic(typeResponseError)
      .generic(typeData);

    const fnOptions = 'fnOptions';

    const awaitSdkFn = $.lazy((ctx) =>
      ctx
        .access(
          plugin.referenceSymbol({
            category: 'sdk',
            resource: 'operation',
            resourceId: operation.id,
          }),
        )
        .call(
          $.object()
            .spread('options')
            .spread(fnOptions)
            .prop('throwOnError', $.literal(true))
            .prop('responseStyle', $.literal('fields')),
        )
        .await(),
    );

    // Always assign full result, then conditionally return based on responseStyle
    const statements: Array<TsDsl<any>> = [
      $.const('result').assign(awaitSdkFn),
      $.const('_data').assign(
        $.ternary($('options').attr('responseStyle').optional().eq($.literal('fields')))
          .do('result')
          .otherwise($('result').attr('data')),
      ),
      $.return($.as($('_data'), typeResponseResult)),
    ];

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
          .generic(TStyle, (g) => g.extends(styleUnion()).default($.type.literal(defaultStyle)))
          .param('options', (p) =>
            p.optional().type(
              $.type.and(
                $.type('Partial').generic(typeData),
                $.type.object().prop('responseStyle', (tp) => tp.optional().type(TStyle)),
              ),
            ),
          )
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
                  .$if(handleMeta(plugin, operation, 'mutationOptions'), (c, v) =>
                    c.prop('meta', v),
                  ),
              ),
            $(mutationOptionsFn).return(),
          ),
      );
    plugin.node(statement);
  } else {
    // --- 'data' code path (default): original code, no TStyle, no ResponseResult/ResponseError ---
    const mutationType = $.type(symbolMutationOptionsType)
      .generic(typeResponse)
      .generic(typeError)
      .generic(typeData);

    const fnOptions = 'fnOptions';

    const awaitSdkFn = $.lazy((ctx) =>
      ctx
        .access(
          plugin.referenceSymbol({
            category: 'sdk',
            resource: 'operation',
            resourceId: operation.id,
          }),
        )
        .call($.object().spread('options').spread(fnOptions).prop('throwOnError', $.literal(true)))
        .await(),
    );

    const statements: Array<TsDsl<any>> = [];
    if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
      statements.push($.return(awaitSdkFn));
    } else {
      statements.push($.const().object('data').assign(awaitSdkFn), $.return('data'));
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
          .param('options', (p) => p.optional().type($.type('Partial').generic(typeData)))
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
                  .$if(handleMeta(plugin, operation, 'mutationOptions'), (c, v) =>
                    c.prop('meta', v),
                  ),
              ),
            $(mutationOptionsFn).return(),
          ),
      );
    plugin.node(statement);
  }
};
