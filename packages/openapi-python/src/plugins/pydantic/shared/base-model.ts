import type { Symbol, SymbolMeta } from '@hey-api/codegen-core';

import { $ } from '../../../py-dsl';
import type { PydanticPlugin } from '../types';
import { identifiers } from '../v2/constants';

export const BASE_MODEL_META = {
  category: 'utility',
  resource: 'BaseModel',
} as const satisfies SymbolMeta;

export function createBaseModel(
  plugin: PydanticPlugin['Instance'],
  symbol: Symbol,
): ReturnType<typeof $.class> {
  const configKwargs = resolveBaseModelConfig(plugin);

  return $.class(symbol)
    .export()
    .extends(plugin.symbols.BaseModel)
    .$if(configKwargs.length, (c) =>
      c.do(
        $.field(identifiers.model_config).assign(
          $(plugin.symbols.ConfigDict).call(...configKwargs),
        ),
      ),
    );
}

export function resolveBaseModelConfig(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: PydanticPlugin['Instance'],
): Array<ReturnType<typeof $.expr | typeof $.kwarg>> {
  const kwargs: Array<ReturnType<typeof $.expr | typeof $.kwarg>> = [];

  kwargs.push($.kwarg('populate_by_name', true));

  return kwargs;
}
