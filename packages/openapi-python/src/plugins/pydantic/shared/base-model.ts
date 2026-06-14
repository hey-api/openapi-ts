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
  const configKwargs = resolveBaseModelConfig({ populateByName: false });

  return $.class(symbol)
    .export()
    .extends(plugin.imports.BaseModel)
    .$if(configKwargs.length, (c) =>
      c.do(
        $.field(identifiers.model_config).assign(
          $(plugin.imports.ConfigDict).call(...configKwargs),
        ),
      ),
    );
}

export function resolveBaseModelConfig(options: {
  populateByName: boolean;
}): Array<ReturnType<typeof $.expr | typeof $.kwarg>> {
  const kwargs: Array<ReturnType<typeof $.expr | typeof $.kwarg>> = [];

  if (options.populateByName) {
    kwargs.push($.kwarg('populate_by_name', true));
  }

  return kwargs;
}
