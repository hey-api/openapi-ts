import { $ } from '~/ts-dsl';

import type { ValidatorArgs } from '../shared/types';
import type { ValidatorResolverArgs } from '../types';
import { identifiers } from './constants';

const defaultValidatorResolver = ({
  schema,
  v,
}: ValidatorResolverArgs): ReturnType<typeof $.return> =>
  $(v).attr(identifiers.async.parseAsync).call(schema, 'data').await().return();

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

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const args: ValidatorResolverArgs = {
    $,
    operation,
    pipes: [],
    plugin,
    schema: symbol,
    v,
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.request;
  const candidates = [resolver, defaultValidatorResolver];
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

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const args: ValidatorResolverArgs = {
    $,
    operation,
    pipes: [],
    plugin,
    schema: symbol,
    v,
  };
  const validator = plugin.config['~resolvers']?.validator;
  const resolver =
    typeof validator === 'function' ? validator : validator?.response;
  const candidates = [resolver, defaultValidatorResolver];
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
