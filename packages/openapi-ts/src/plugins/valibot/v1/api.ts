import type ts from 'typescript';

import { tsc } from '../../../tsc';
import type { ValidatorArgs } from '../shared/types';
import { identifiers } from './constants';

export const createRequestValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(plugin.api.selector('data', operation.id));
  if (!symbol) return;

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );

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
              expression: v.placeholder,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              tsc.identifier({ text: symbol.placeholder }),
              tsc.identifier({ text: dataParameterName }),
            ],
          }),
        }),
      }),
    ],
  });
};

export const createResponseValidatorV1 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(
    plugin.api.selector('responses', operation.id),
  );
  if (!symbol) return;

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );

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
              expression: v.placeholder,
              name: identifiers.async.parseAsync,
            }),
            parameters: [
              tsc.identifier({ text: symbol.placeholder }),
              tsc.identifier({ text: dataParameterName }),
            ],
          }),
        }),
      }),
    ],
  });
};
