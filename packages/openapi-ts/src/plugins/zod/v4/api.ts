import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ValidatorResolverContext } from '../resolvers';
import type { ValidatorArgs } from '../shared/types';

const validatorResolver = (ctx: ValidatorResolverContext): ReturnType<typeof $.return> => {
  const { schema } = ctx.symbols;
  return $(schema).attr(identifiers.parseAsync).call('data').await().return();
};

export const createRequestValidatorV4 = ({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'zod',
  });
  if (!symbol) return;

  const z = plugin.external('zod.z');
  const ctx: ValidatorResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    operation,
    plugin,
    symbols: {
      schema: symbol,
      z,
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.request;
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

export const createResponseValidatorV4 = ({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'zod',
  });
  if (!symbol) return;

  const z = plugin.external('zod.z');
  const ctx: ValidatorResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    operation,
    plugin,
    symbols: {
      schema: symbol,
      z,
    },
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.response;
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
