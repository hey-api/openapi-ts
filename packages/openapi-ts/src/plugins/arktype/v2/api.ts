import type { TsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { ValidatorArgs } from '../shared/types';

export const createRequestValidatorV2 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'arktype',
  });
  if (!symbol) return;

  // const out = User({
  //   name: "Alan Turing",
  //   device: {
  //     platform: "enigma",
  //     versions: [0, "1", 0n]
  //   }
  // })
  // if (out instanceof type.errors) {
  //   // hover out.summary to see validation errors
  //   console.error(out.summary)
  // } else {
  //   // hover out to see your validated data
  //   console.log(`Hello, ${out.name}`)
  // }
  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $.return(
        $(symbol.placeholder)
          .attr('parseAsync')
          .call($(dataParameterName))
          .await(),
      ),
    );
};

export const createResponseValidatorV2 = ({
  operation,
  plugin,
}: ValidatorArgs): TsDsl | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'arktype',
  });
  if (!symbol) return;

  const dataParameterName = 'data';
  return $.func()
    .async()
    .param(dataParameterName)
    .do(
      $.return(
        $(symbol.placeholder)
          .attr('parseAsync')
          .call($(dataParameterName))
          .await(),
      ),
    );
};
