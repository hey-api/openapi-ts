import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { Pipes } from '../../shared/pipes';
import { pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotFinal, ValibotResult } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

interface IntersectionToPipesContext {
  applyModifiers: (result: ValibotResult, options?: { optional?: boolean }) => ValibotFinal;
  childResults: Array<ValibotResult>;
  parentSchema: IR.SchemaObject;
  plugin: ValibotPlugin['Instance'];
}

export function intersectionToPipes(ctx: IntersectionToPipesContext): CompositeHandlerResult {
  const { applyModifiers, childResults, plugin } = ctx;

  const v = plugin.external('valibot.v');
  let pipes: Pipes;

  if (childResults.length === 0) {
    pipes = [$(v).attr(identifiers.schemas.any).call()];
  } else if (childResults.length === 1) {
    const finalResult = applyModifiers(childResults[0]!);
    pipes = finalResult.pipes;
  } else {
    const itemNodes = childResults.map((item) => pipesToNode(item.pipes, plugin));
    pipes = [
      $(v)
        .attr(identifiers.schemas.intersect)
        .call($.array(...itemNodes)),
    ];
  }

  return { childResults, pipes };
}
