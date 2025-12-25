import { $ } from '~/ts-dsl';

import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';
import type { ValidatorResolverArgs } from '../types';

const validatorResolver = ({
  schema,
}: ValidatorResolverArgs): ReturnType<typeof $.return> =>
  $(schema).attr(identifiers.parseAsync).call('data').await().return();

export const createRequestValidatorMini = ({
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

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  const args: ValidatorResolverArgs = {
    $,
    chain: undefined,
    operation,
    plugin,
    schema: symbol,
    z,
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

export const createResponseValidatorMini = ({
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

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  const args: ValidatorResolverArgs = {
    $,
    chain: undefined,
    operation,
    plugin,
    schema: symbol,
    z,
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
