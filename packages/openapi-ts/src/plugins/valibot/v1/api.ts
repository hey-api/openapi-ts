import { $ } from '~/ts-dsl';

import { pipes } from '../shared/pipes';
import type { ValidatorArgs } from '../shared/types';
import type { ValidatorResolverArgs } from '../types';
import { identifiers } from './constants';

const validatorResolver = (
  ctx: ValidatorResolverArgs,
): ReturnType<typeof $.return> => {
  const { schema } = ctx;
  const { v } = ctx.symbols;
  return $(v)
    .attr(identifiers.async.parseAsync)
    .call(schema, 'data')
    .await()
    .return();
};

export const createRequestValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'valibot',
  });
  if (!symbol) return;

  const args: ValidatorResolverArgs = {
    $,
    operation,
    pipes,
    plugin,
    result: [],
    schema: symbol,
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.request;
  const candidates = [resolver, validatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(args);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
  return;
};

export const createResponseValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'valibot',
  });
  if (!symbol) return;

  const args: ValidatorResolverArgs = {
    $,
    operation,
    pipes,
    plugin,
    result: [],
    schema: symbol,
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.response;
  const candidates = [resolver, validatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(args);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
  return;
};
