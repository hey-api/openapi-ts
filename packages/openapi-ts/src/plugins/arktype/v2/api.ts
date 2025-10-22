import type ts from 'typescript';

import { tsc } from '../../../tsc';
// import { identifiers } from '../constants';
import type { ValidatorArgs } from '../shared/types';

export const createRequestValidatorV2 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(plugin.api.selector('data', operation.id));
  if (!symbol) return;

  // const out = User({
  //   name: "Alan Turing",
  //   device: {
  //     platform: "enigma",
  //     versions: [0, "1", 0n]
  //   }
  // })
  // if (out instanceof type.errors) {
  //   // hover out.summary to see validation errors
  //   console.error(out.summary)
  // } else {
  //   // hover out to see your validated data
  //   console.log(`Hello, ${out.name}`)
  // }
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
              name: 'parseAsync',
              // name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};

export const createResponseValidatorV2 = ({
  operation,
  plugin,
}: ValidatorArgs): ts.ArrowFunction | undefined => {
  const symbol = plugin.getSymbol(
    plugin.api.selector('responses', operation.id),
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
              name: 'parseAsync',
              // name: identifiers.parseAsync,
            }),
            parameters: [tsc.identifier({ text: dataParameterName })],
          }),
        }),
      }),
    ],
  });
};
