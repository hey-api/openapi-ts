import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { pipesToNode } from '../../shared/pipes';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export function tupleToAst(
  options: IrSchemaToAstOptions & {
    schema: SchemaWithType<'tuple'>;
  },
): Omit<Ast, 'typeName'> {
  const { plugin, schema } = options;

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const v = plugin.external('valibot.v');

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
        ...options,
        schema: item,
        state: {
          ...options.state,
          path: ref([...fromRef(options.state.path), 'items', index]),
        },
      });
      if (schemaPipes.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
      return pipesToNode(schemaPipes.pipes, plugin);
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
        ...options,
        schema: {
          type: 'unknown',
        },
      }),
    ],
  };
}
