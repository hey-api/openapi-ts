import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';

export const createRequestValidatorV3 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'zod',
  });
  if (!symbol) return;

  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $(symbol.placeholder)
        .attr(identifiers.parseAsync)
        .call(dataParameterName)
        .await()
        .return(),
    );
};

export const createResponseValidatorV3 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'zod',
  });
  if (!symbol) return;

  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $(symbol.placeholder)
        .attr(identifiers.parseAsync)
        .call(dataParameterName)
        .await()
        .return(),
    );
};
