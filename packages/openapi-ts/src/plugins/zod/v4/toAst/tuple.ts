import { fromRef, ref } from '@hey-api/codegen-core';

import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      $(z).attr(identifiers.literal).call($.fromValue(value)),
    );
    result.expression = $(z)
      .attr(identifiers.tuple)
      .call($.array(...tupleElements));
    return result as Omit<Ast, 'typeName'>;
  }

  const tupleElements: Array<ReturnType<typeof $.call | typeof $.expr>> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const itemSchema = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: ref([...fromRef(state.path), 'items', index]),
        },
      });
      tupleElements.push(itemSchema.expression);
      if (itemSchema.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
    });
  }

  result.expression = $(z)
    .attr(identifiers.tuple)
    .call($.array(...tupleElements));

  return result as Omit<Ast, 'typeName'>;
};
