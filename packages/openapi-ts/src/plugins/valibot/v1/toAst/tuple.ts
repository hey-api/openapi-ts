import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { $ } from '~/ts-dsl';

import { pipesToAst } from '../../shared/pipesToAst';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      $(v).attr(identifiers.schemas.literal).call($.fromValue(value)),
    );
    result.pipes = [
      $(v)
        .attr(identifiers.schemas.tuple)
        .call($.array(...tupleElements)),
    ];
    return result as Omit<Ast, 'typeName'>;
  }

  if (schema.items) {
    const tupleElements = schema.items.map((item, index) => {
      const schemaPipes = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: toRef([...state.path.value, 'items', index]),
        },
      });
      if (schemaPipes.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
      return pipesToAst({ pipes: schemaPipes.pipes, plugin });
    });
    result.pipes = [
      $(v)
        .attr(identifiers.schemas.tuple)
        .call($.array(...tupleElements)),
    ];
    return result as Omit<Ast, 'typeName'>;
  }

  return {
    pipes: [
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
        state,
      }),
    ],
  };
};
