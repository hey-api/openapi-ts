import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import type { MaybeTsDsl, TypeTsDsl } from '../../../../../ts-dsl';
import { $ } from '../../../../../ts-dsl';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export function arrayToAst({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'array'>;
}): TypeTsDsl {
  if (!schema.items) {
    return $.type('Array').generic($.type(plugin.config.topType));
  }

  schema = deduplicateSchema({ detectFormat: true, schema });

  const itemTypes: Array<MaybeTsDsl<TypeTsDsl>> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const type = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: ref([...fromRef(state.path), 'items', index]),
        },
      });
      itemTypes.push(type);
    });
  }

  if (itemTypes.length === 1) {
    return $.type('Array').generic(itemTypes[0]!);
  }

  return schema.logicalOperator === 'and'
    ? $.type('Array').generic($.type.and(...itemTypes))
    : $.type('Array').generic($.type.or(...itemTypes));
}
