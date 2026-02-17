import type { SchemaWithType } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type {
  Ast,
  IrSchemaToAstOptions,
  ZodAppliedResult,
  ZodSchemaResult,
} from '../../shared/types';

export function tupleToAst(
  options: IrSchemaToAstOptions & {
    applyModifiers: (result: ZodSchemaResult, opts: { optional?: boolean }) => ZodAppliedResult;
    schema: SchemaWithType<'tuple'>;
  },
): Omit<Ast, 'typeName'> {
  const { applyModifiers, plugin, schema, walk } = options;

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const z = plugin.external('zod.z');

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
      tupleElements.push(finalExpr.expression);
    });
  }

  result.expression = $(z)
    .attr(identifiers.tuple)
    .call($.array(...tupleElements));

  return result as Omit<Ast, 'typeName'>;
}
