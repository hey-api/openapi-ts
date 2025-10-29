import type ts from 'typescript';

import { tsc } from '~/tsc';

import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';

export const createRequestValidatorV4 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'data',
    tool: 'zod',
  });
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

export const createResponseValidatorV4 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'zod',
  });
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
