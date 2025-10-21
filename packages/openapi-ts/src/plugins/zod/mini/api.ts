import type ts from 'typescript';

import { tsc } from '../../../tsc';
import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';

export const createRequestValidatorMini = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(plugin.api.getSelector('data', operation.id));
  if (!symbol) return;

  const dataParameterName = 'data';

  return tsc.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      tsc.returnStatement({
        expression: tsc.awaitExpression({
          expression: tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: symbol.placeholder,
              name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

export const createResponseValidatorMini = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(
    plugin.api.getSelector('responses', operation.id),
  );
  if (!symbol) return;

  const dataParameterName = 'data';

  return tsc.arrowFunction({
    async: true,
    parameters: [
      {
        name: dataParameterName,
      },
    ],
    statements: [
      tsc.returnStatement({
        expression: tsc.awaitExpression({
          expression: tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: symbol.placeholder,
              name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};
