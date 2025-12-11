import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '~/plugins';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): MaybeTsDsl<TypeTsDsl> => {
  let itemTypes: Array<MaybeTsDsl<TypeTsDsl>> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => $.type.fromValue(value));
  } else if (schema.items) {
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

  return $.type.tuple(...itemTypes);
};
