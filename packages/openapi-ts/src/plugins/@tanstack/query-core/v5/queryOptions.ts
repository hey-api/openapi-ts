import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import type { TsDsl } from '../../../../ts-dsl';
import { $ } from '../../../../ts-dsl';
import { createQueryKeyFunction, createQueryKeyType, queryKeyStatement } from '../queryKey';
import { handleMeta } from '../shared/meta';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';
const TStyle = 'TStyle';
const styleUnion = () => $.type.or($.type.literal('data'), $.type.literal('fields'));

export const createQueryOptions = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });

  if (
    !plugin.querySymbol({
      category: 'utility',
      resource: 'createQueryKey',
      tool: plugin.name,
    })
  ) {
    createQueryKeyType({ plugin });
    createQueryKeyFunction({ plugin });
  }

  const symbolQueryOptions = plugin.external(`${plugin.name}.queryOptions`);

  const symbolQueryKey = plugin.symbol(applyNaming(operation.id, plugin.config.queryKeys));
  const node = queryKeyStatement({
    isInfinite: false,
    operation,
    plugin,
    symbol: symbolQueryKey,
  });
  plugin.node(node);

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
            .spread(optionsParamName)
            .spread($('queryKey').attr(0))
            .prop('signal', $('signal'))
            .prop('throwOnError', $.literal(true))
            .prop('responseStyle', $.literal('fields')),
        )
        .await(),
    );

    // Always assign full result, then conditionally return based on responseStyle
    const statements: Array<TsDsl<any>> = [
      $.const('result').assign(awaitSdkFn),
      $.const('_data').assign(
        $.ternary($(optionsParamName).attr('responseStyle').optional().eq($.literal('fields')))
          .do('result')
          .otherwise($('result').attr('data')),
      ),
      $.return($.as($('_data'), typeResponseResult)),
    ];

    const queryOptionsObj = $.object()
      .pretty()
      .prop(
        'queryFn',
        $.func()
          .async()
          .param((p) => p.object('queryKey', 'signal'))
          .do(...statements),
      )
      .prop('queryKey', $(symbolQueryKey).call(optionsParamName))
      .$if(handleMeta(plugin, operation, 'queryOptions'), (o, v) => o.prop('meta', v));

    const typeData = useTypeData({ operation, plugin });

    const symbolQueryOptionsFn = plugin.symbol(
      applyNaming(operation.id, plugin.config.queryOptions),
      {
        meta: {
          category: 'hook',
          resource: 'operation',
          resourceId: operation.id,
          role: 'queryOptions',
          tool: plugin.name,
        },
      },
    );
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
    const statement = $.const(symbolQueryOptionsFn)
      .export(plugin.config.queryOptions.exported)
      .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
      .assign(
        $.func()
          .generic(TStyle, (g) => g.extends(styleUnion()).default($.type.literal(defaultStyle)))
          .param(optionsParamName, (p) =>
            p.required(isRequiredOptions).type(
              $.type.and(
                typeData,
                $.type.object().prop('responseStyle', (tp) => tp.optional().type(TStyle)),
              ),
            ),
          )
          .do(
            $(symbolQueryOptions)
              .call(queryOptionsObj)
              .generics(
                typeResponseResult,
                typeResponseError,
                typeResponseResult,
                $(symbolQueryKey).returnType(),
              )
              .return(),
          ),
      );
    plugin.node(statement);
  } else {
    // --- 'data' code path (default): original code, no TStyle, no ResponseResult/ResponseError ---
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
            .spread(optionsParamName)
            .spread($('queryKey').attr(0))
            .prop('signal', $('signal'))
            .prop('throwOnError', $.literal(true)),
        )
        .await(),
    );

    const statements: Array<TsDsl<any>> = [];
    if (plugin.getPluginOrThrow('@hey-api/sdk').config.responseStyle === 'data') {
      statements.push($.return(awaitSdkFn));
    } else {
      statements.push($.const().object('data').assign(awaitSdkFn), $.return('data'));
    }

    const queryOptionsObj = $.object()
      .pretty()
      .prop(
        'queryFn',
        $.func()
          .async()
          .param((p) => p.object('queryKey', 'signal'))
          .do(...statements),
      )
      .prop('queryKey', $(symbolQueryKey).call(optionsParamName))
      .$if(handleMeta(plugin, operation, 'queryOptions'), (o, v) => o.prop('meta', v));

    const symbolQueryOptionsFn = plugin.symbol(
      applyNaming(operation.id, plugin.config.queryOptions),
      {
        meta: {
          category: 'hook',
          resource: 'operation',
          resourceId: operation.id,
          role: 'queryOptions',
          tool: plugin.name,
        },
      },
    );
    // TODO: add type error
    // TODO: AxiosError<PutSubmissionMetaError>
    const statement = $.const(symbolQueryOptionsFn)
      .export(plugin.config.queryOptions.exported)
      .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
      .assign(
        $.func()
          .param(optionsParamName, (p) =>
            p.required(isRequiredOptions).type(useTypeData({ operation, plugin })),
          )
          .do(
            $(symbolQueryOptions)
              .call(queryOptionsObj)
              .generics(
                typeResponse,
                useTypeError({ operation, plugin }),
                typeResponse,
                $(symbolQueryKey).returnType(),
              )
              .return(),
          ),
      );
    plugin.node(statement);
  }
};
