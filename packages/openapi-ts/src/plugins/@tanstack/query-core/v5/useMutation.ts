import type { IR } from '@hey-api/shared';
import { applyNaming } from '@hey-api/shared';

import { createOperationComment } from '../../../../plugins/shared/utils/operation';
import { $ } from '../../../../ts-dsl';
import { useTypeData, useTypeError, useTypeResponse } from '../shared/useType';
import type { PluginInstance } from '../types';

const optionsParamName = 'options';
const mutationOptionsParamName = 'mutationOptions';

export const createUseMutation = ({
  operation,
  plugin,
}: {
  operation: IR.OperationObject;
  plugin: PluginInstance;
}): void => {
  if (!('useMutation' in plugin.config)) {
    return;
  }

  const symbolUseMutationFn = plugin.symbol(applyNaming(operation.id, plugin.config.useMutation));

  const symbolUseMutation = plugin.external(`${plugin.name}.useMutation`);

  const typeData = useTypeData({ operation, plugin });

  const symbolMutationOptionsType = plugin.external(`${plugin.name}.MutationOptions`);
  const mutationType = $.type(symbolMutationOptionsType)
    .generic(useTypeResponse({ operation, plugin }))
    .generic(useTypeError({ operation, plugin }))
    .generic(typeData);

  const symbolMutationOptionsFn = plugin.referenceSymbol({
    category: 'hook',
    resource: 'operation',
    resourceId: operation.id,
    role: 'mutationOptions',
    tool: plugin.name,
  });
  const includeRequestOptions =
    'useMutation' in plugin.config && plugin.config.useMutation.requestOptions;

  const func = $.func().param(mutationOptionsParamName, (p) =>
    p
      .optional()
      .type(
        $.type('Partial').generic(
          $.type('Omit', (t) => t.generics(mutationType, $.type.literal('mutationFn'))),
        ),
      ),
  );

  if (includeRequestOptions) {
    func.param(optionsParamName, (p) => p.optional().type($.type('Partial').generic(typeData)));
  }

  func.do(
    $(symbolUseMutation)
      .call(
        $.object()
          .spread(
            includeRequestOptions
              ? $(symbolMutationOptionsFn).call(optionsParamName)
              : $(symbolMutationOptionsFn).call(),
          )
          .spread(mutationOptionsParamName),
      )
      .return(),
  );

  const statement = $.const(symbolUseMutationFn)
    .export()
    .$if(plugin.config.comments && createOperationComment(operation), (c, v) => c.doc(v))
    .assign(func);
  plugin.node(statement);
};
