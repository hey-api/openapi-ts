import type ts from 'typescript';

import { tsc } from '../../../tsc';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';

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

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.methods.pipe,
    }),
    parameters: pipes,
  });
  return expression;
};
