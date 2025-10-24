import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): ts.TypeNode => {
  let itemTypes: Array<ts.Expression | ts.TypeNode> = [];

  if (schema.const && Array.isArray(schema.const)) {
    itemTypes = schema.const.map((value) => {
      const expression = tsc.valueToExpression({ value });
      return expression ?? tsc.identifier({ text: plugin.config.topType });
    });
  } else if (schema.items) {
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

  return tsc.typeTupleNode({
    types: itemTypes,
  });
};
