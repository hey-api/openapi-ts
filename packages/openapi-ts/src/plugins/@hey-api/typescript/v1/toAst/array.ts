import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const arrayToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'array'>;
}): ts.TypeNode => {
  if (!schema.items) {
    return tsc.typeArrayNode(
      tsc.keywordTypeNode({ keyword: plugin.config.topType }),
    );
  }

  schema = deduplicateSchema({ detectFormat: true, schema });

  const itemTypes: Array<ts.TypeNode> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const type = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: toRef([...state.path.value, 'items', index]),
        },
      });
      itemTypes.push(type);
    });
  }

  if (itemTypes.length === 1) {
    return tsc.typeArrayNode(itemTypes[0]!);
  }

  if (schema.logicalOperator === 'and') {
    return tsc.typeArrayNode(tsc.typeIntersectionNode({ types: itemTypes }));
  }

  return tsc.typeArrayNode(tsc.typeUnionNode({ types: itemTypes }));
};
