import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotFinal, ValibotResult } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

interface TupleToPipesContext {
  applyModifiers: (result: ValibotResult, options?: { optional?: boolean }) => ValibotFinal;
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'tuple'>;
  walk: Walker<ValibotResult, ValibotPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ValibotPlugin['Instance']>;
}

export function tupleToPipes(ctx: TupleToPipesContext): CompositeHandlerResult {
  const { plugin, schema, walk, walkerCtx } = ctx;

  const v = plugin.external('valibot.v');
  const childResults: Array<ValibotResult> = [];

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      $(v).attr(identifiers.schemas.literal).call($.fromValue(value)),
    );

    return {
      childResults: [],
      pipes: [
        $(v)
          .attr(identifiers.schemas.tuple)
          .call($.array(...tupleElements)),
      ],
    };
  }

  if (schema.items) {
    for (let i = 0; i < schema.items.length; i++) {
      const item = schema.items[i]!;
      const result = walk(item, childContext(walkerCtx, 'items', i));
      childResults.push(result);
    }

    const tupleElements = childResults.map((r) => pipesToNode(ctx.applyModifiers(r).pipes, plugin));

    return {
      childResults,
      pipes: [
        $(v)
          .attr(identifiers.schemas.tuple)
          .call($.array(...tupleElements)),
      ],
    };
  }

  return {
    childResults: [],
    pipes: [unknownToPipes({ plugin })],
  };
}
