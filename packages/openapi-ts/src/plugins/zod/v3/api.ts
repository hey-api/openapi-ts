import type ts from 'typescript';

import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';
import type { ValidatorResolverArgs } from '../types';

const defaultValidatorResolver = ({
  schema,
}: ValidatorResolverArgs): TsDsl<ts.Statement> =>
  $(schema.placeholder)
    .attr(identifiers.parseAsync)
    .call('data')
    .await()
    .return();

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

  const args: ValidatorResolverArgs = {
    $,
    chain: undefined,
    operation,
    plugin,
    schema: symbol,
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

  const args: ValidatorResolverArgs = {
    $,
    chain: undefined,
    operation,
    plugin,
    schema: symbol,
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
