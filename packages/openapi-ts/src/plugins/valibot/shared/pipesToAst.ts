import { $ } from '~/ts-dsl';

import type { ValibotPlugin } from '../types';
import { identifiers } from '../v1/constants';

export const pipesToAst = (
  pipes: ReadonlyArray<ReturnType<typeof $.call | typeof $.expr>>,
  plugin: ValibotPlugin['Instance'],
): ReturnType<typeof $.call | typeof $.expr> => {
  if (pipes.length === 1) {
    return pipes[0]!;
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  return $(v)
    .attr(identifiers.methods.pipe)
    .call(...pipes);
};
