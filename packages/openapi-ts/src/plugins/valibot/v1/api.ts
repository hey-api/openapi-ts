import { $, type TsDsl } from '~/ts-dsl';

import type { ValidatorArgs } from '../shared/types';
import { identifiers } from './constants';

export const createRequestValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'valibot',
  });
  if (!symbol) return;

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $(v.placeholder)
        .attr(identifiers.async.parseAsync)
        .call(symbol.placeholder, dataParameterName)
        .await()
        .return(),
    );
};

export const createResponseValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'valibot',
  });
  if (!symbol) return;

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $(v.placeholder)
        .attr(identifiers.async.parseAsync)
        .call(symbol.placeholder, dataParameterName)
        .await()
        .return(),
    );
};
