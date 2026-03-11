import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { CompositeHandlerResult, ZodFinal, ZodResult } from '../../shared/types';
import type { ZodPlugin } from '../../types';

interface TupleToAstOptions {
  applyModifiers: (result: ZodResult, opts: { optional?: boolean }) => ZodFinal;
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<ZodResult, ZodPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ZodPlugin['Instance']>;
}

export function tupleToAst({
  applyModifiers,
  plugin,
  schema,
  walk,
  walkerCtx,
}: TupleToAstOptions): CompositeHandlerResult {
  const childResults: Array<ZodResult> = [];

  const z = plugin.external('zod.z');

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      $(z).attr(identifiers.literal).call($.fromValue(value)),
    );
    const expression = $(z)
      .attr(identifiers.tuple)
      .call($.array(...tupleElements));
    return {
      childResults,
      expression,
    };
  }

  const tupleElements: Array<Chain> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const itemResult = walk(item, childContext(walkerCtx, 'items', index));
      childResults.push(itemResult);

      const finalExpr = applyModifiers(itemResult, { optional: false });
      tupleElements.push(finalExpr.expression);
    });
  }

  const expression = $(z)
    .attr(identifiers.tuple)
    .call($.array(...tupleElements));

  return {
    childResults,
    expression,
  };
}
