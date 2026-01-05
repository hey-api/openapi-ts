import { $ } from '~/ts-dsl';

import type { ValidatorResolverContext } from '../resolvers';
import { pipes } from '../shared/pipes';
import type { ValidatorArgs } from '../shared/types';
import { identifiers } from './constants';

const validatorResolver = (
  ctx: ValidatorResolverContext,
): ReturnType<typeof $.return> => {
  const { schema, v } = ctx.symbols;
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

  const ctx: ValidatorResolverContext = {
    $,
    operation,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    symbols: {
      schema: symbol,
      v: plugin.external('valibot.v'),
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.request;
  const candidates = [resolver, validatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
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

  const ctx: ValidatorResolverContext = {
    $,
    operation,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    symbols: {
      schema: symbol,
      v: plugin.external('valibot.v'),
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.response;
  const candidates = [resolver, validatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
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
