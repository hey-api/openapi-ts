import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { Pipes } from '../../shared/pipes';
import { pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotFinal, ValibotResult } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

interface ArrayToPipesContext {
  applyModifiers: (result: ValibotResult, options?: { optional?: boolean }) => ValibotFinal;
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  walk: Walker<ValibotResult, ValibotPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ValibotPlugin['Instance']>;
}

export function arrayToPipes(ctx: ArrayToPipesContext): CompositeHandlerResult {
  const { plugin, walk, walkerCtx } = ctx;
  let { schema } = ctx;

  const v = plugin.external('valibot.v');
  const arrayFn = $(v).attr(identifiers.schemas.array);
  const childResults: Array<ValibotResult> = [];
  const resultPipes: Pipes = [];

  if (!schema.items) {
    resultPipes.push(arrayFn.call(unknownToPipes({ plugin })));
  } else {
    schema = deduplicateSchema({ schema });

    for (let i = 0; i < schema.items!.length; i++) {
      const item = schema.items![i]!;
      const result = walk(item, childContext(walkerCtx, 'items', i));
      childResults.push(result);
    }

    if (childResults.length === 1) {
      const itemNode = pipesToNode(ctx.applyModifiers(childResults[0]!).pipes, plugin);
      resultPipes.push(arrayFn.call(itemNode));
    } else {
      // TODO: handle intersection/union properly
      resultPipes.push(arrayFn.call(unknownToPipes({ plugin })));
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    resultPipes.push($(v).attr(identifiers.actions.length).call($.fromValue(schema.minItems)));
  } else {
    if (schema.minItems !== undefined) {
      resultPipes.push($(v).attr(identifiers.actions.minLength).call($.fromValue(schema.minItems)));
    }
    if (schema.maxItems !== undefined) {
      resultPipes.push($(v).attr(identifiers.actions.maxLength).call($.fromValue(schema.maxItems)));
    }
  }

  return {
    childResults,
    pipes: resultPipes,
  };
}
