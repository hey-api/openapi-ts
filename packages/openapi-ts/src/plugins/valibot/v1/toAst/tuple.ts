import type { SchemaResult, SchemaWithType } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { pipesToNode } from '../../shared/pipes';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToAst } from './unknown';

export function tupleToAst(
  options: IrSchemaToAstOptions & {
    applyModifiers: (result: SchemaResult<Ast>, opts: { optional?: boolean }) => Ast;
    schema: SchemaWithType<'tuple'>;
  },
): Omit<Ast, 'typeName'> {
  const { applyModifiers, plugin, schema, walk } = options;

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
      const itemResult = walk(
        item,
        childContext(
          {
            path: options.state.path,
            plugin: options.plugin,
          },
          'items',
          index,
        ),
      );
      if (itemResult.hasLazyExpression) {
        result.hasLazyExpression = true;
      }

      const finalExpr = applyModifiers(itemResult, { optional: false });
      return pipesToNode(finalExpr.pipes, plugin);
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
