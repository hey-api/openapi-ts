import type { IR } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { Pipes } from '../../shared/pipes';
import { pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotFinal, ValibotResult } from '../../shared/types';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

interface UnionToPipesContext {
  applyModifiers: (result: ValibotResult, options?: { optional?: boolean }) => ValibotFinal;
  childResults: Array<ValibotResult>;
  parentSchema: IR.SchemaObject;
  plugin: ValibotPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}

export function unionToPipes(ctx: UnionToPipesContext): CompositeHandlerResult {
  const { childResults, plugin, schemas } = ctx;

  const nonNullItems: Array<ValibotResult> = [];
  childResults.forEach((item, index) => {
    const schema = schemas[index]!;
    if (schema.type !== 'null') {
      nonNullItems.push(item);
    }
  });

  const v = plugin.external('valibot.v');
  let pipes: Pipes;

  if (nonNullItems.length === 0) {
    pipes = [$(v).attr(identifiers.schemas.null).call()];
  } else if (nonNullItems.length === 1) {
    pipes = nonNullItems[0]!.pipes;
  } else {
    const itemNodes = nonNullItems.map((i) => pipesToNode(i.pipes, plugin));
    pipes = [
      $(v)
        .attr(identifiers.schemas.union)
        .call($.array(...itemNodes)),
    ];
  }

  return {
    childResults,
    pipes,
  };
}
