import type ts from 'typescript';

import { $ } from '~/ts-dsl';

import type { ValibotPlugin } from '../types';
import { identifiers } from '../v1/constants';

export const pipesToAst = ({
  pipes,
  plugin,
}: {
  pipes: Array<ts.Expression>;
  plugin: ValibotPlugin['Instance'];
}): ts.Expression => {
  if (pipes.length === 1) {
    return pipes[0]!;
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  return $(v.placeholder).attr(identifiers.methods.pipe).call(...pipes).$render();
};
