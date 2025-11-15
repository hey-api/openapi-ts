import type ts from 'typescript';

import { $, TsDsl } from '~/ts-dsl';

import type { ValibotPlugin } from '../types';
import { identifiers } from '../v1/constants';

export const pipesToAst = ({
  pipes,
  plugin,
}: {
  pipes: ReadonlyArray<ts.Expression | ReturnType<typeof $.call>>;
  plugin: ValibotPlugin['Instance'];
}): ts.Expression => {
  if (pipes.length === 1) {
    return pipes[0] instanceof TsDsl ? pipes[0].$render() : pipes[0]!;
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  return $(v.placeholder)
    .attr(identifiers.methods.pipe)
    .call(...pipes)
    .$render();
};
