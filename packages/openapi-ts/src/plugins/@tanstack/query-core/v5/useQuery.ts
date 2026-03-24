import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import {
  createOperationComment,
  hasOperationSse,
  isOperationOptionsRequired,
} from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData } from '../shared/useType';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';
const queryOptionsKey = 'queryOptions';
const sdkOptionsName = 'sdkOptions';
const helperName = 'queryWithOptions';

export const createQueryWithOptionsHelper = ({ plugin }: { plugin: PluginInstance }): void => {
  const symbolUseQuery = plugin.external(`${plugin.name}.useQuery`);

  const symbolHelper = plugin.symbol(
    applyNaming(helperName, {
      case: plugin.config.case,
    }),
    {
      meta: {
        category: 'utility',
        resource: helperName,
        tool: plugin.name,
      },
    },
  );

  const fn = $.const(symbolHelper).assign(
    $.func()
      .param('optionsFn', (p) => p.type('(...args: Array<any>) => any'))
      .param(optionsParamName, (p) => p.optional().type('any'))
      .do(
        $.if($(`typeof ${optionsParamName} !== 'object' && ${optionsParamName} !== undefined`)).do(
          $(symbolUseQuery).call($('optionsFn').call(optionsParamName)).return(),
        ),
        $.const()
          .object(queryOptionsKey)
          .spread(sdkOptionsName)
          .assign($(optionsParamName).coalesce($.object())),
        $(symbolUseQuery)
          .call($.object().spread($('optionsFn').call(sdkOptionsName)).spread(queryOptionsKey))
          .return(),
      ),
  );
  plugin.node(fn);
};

export const createUseQuery = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  if (hasOperationSse({ operation })) {
    return;
  }

  if (!('useQuery' in plugin.config)) {
    return;
  }

  if (
    !plugin.getSymbol({
      category: 'utility',
      resource: helperName,
      tool: plugin.name,
    })
  ) {
    createQueryWithOptionsHelper({ plugin });
  }

  const symbolHelper = plugin.referenceSymbol({
    category: 'utility',
    resource: helperName,
    tool: plugin.name,
  });

  const symbolUseQueryFn = plugin.symbol(applyNaming(operation.id, plugin.config.useQuery));

  const isRequiredOptions = isOperationOptionsRequired({
    context: plugin.context,
    operation,
  });
  const typeData = useTypeData({ operation, plugin });

  const symbolSkipToken = $(plugin.external(`${plugin.name}.skipToken`));
  const sdkParamType = $.type.or(typeData, $.type.query(symbolSkipToken));

  const symbolQueryOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'queryOptions',
    tool: plugin.name,
  });

  const queryOptionsType = $.type('Partial').generic(
    $.type('Omit', (t) =>
      t.generics(
        $(symbolQueryOptionsFn).returnType(),
        $.type.or($.type.literal('queryKey'), $.type.literal('queryFn')),
      ),
    ),
  );

  const mergedParamType = $.type.and(
    sdkParamType,
    $.type.object().prop(queryOptionsKey, (p) => p.optional().type(queryOptionsType)),
  );

  const statement = $.const(symbolUseQueryFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(
      $.func()
        .param(optionsParamName, (p) => p.required(isRequiredOptions).type(mergedParamType))
        .do($(symbolHelper).call(symbolQueryOptionsFn, optionsParamName).return()),
    );
  plugin.node(statement);
};
