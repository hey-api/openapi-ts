import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { pipesToAst } from '../pipesToAst';

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );

  if (typeof schema.const === 'string') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return expression;
  }

  const pipes: Array<ts.CallExpression> = [];

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.string,
    }),
  });
  pipes.push(expression);

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.actions.isoDate,
            }),
          }),
        );
        break;
      case 'date-time':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.actions.isoTimestamp,
            }),
          }),
        );
        break;
      case 'ipv4':
      case 'ipv6':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.actions.ip,
            }),
          }),
        );
        break;
      case 'uri':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: identifiers.actions.url,
            }),
          }),
        );
        break;
      case 'email':
      case 'time':
      case 'uuid':
        pipes.push(
          tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: v.placeholder,
              name: tsc.identifier({ text: schema.format }),
            }),
          }),
        );
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
    pipes.push(expression);
  } else {
    if (schema.minLength !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.minLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
      pipes.push(expression);
    }

    if (schema.maxLength !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.maxLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
      pipes.push(expression);
    }
  }

  if (schema.pattern) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
    });
    pipes.push(expression);
  }

  return pipesToAst({ pipes, plugin });
};
