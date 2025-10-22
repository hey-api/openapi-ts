import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}) => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  if (typeof schema.const === 'string') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return expression;
  }

  let stringExpression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.string,
    }),
  });

  const dateTimeOptions: { key: string; value: boolean }[] = [];

  if (plugin.config.dates.offset) {
    dateTimeOptions.push({ key: 'offset', value: true });
  }
  if (plugin.config.dates.local) {
    dateTimeOptions.push({ key: 'local', value: true });
  }

  if (schema.format) {
    switch (schema.format) {
      case 'date':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.date,
          }),
        });
        break;
      case 'date-time':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.datetime,
          }),
          parameters:
            dateTimeOptions.length > 0
              ? [
                  tsc.objectExpression({
                    obj: dateTimeOptions,
                  }),
                ]
              : [],
        });
        break;
      case 'email':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.email,
          }),
        });
        break;
      case 'ipv4':
      case 'ipv6':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.ip,
          }),
        });
        break;
      case 'time':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.time,
          }),
        });
        break;
      case 'uri':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.url,
          }),
        });
        break;
      case 'uuid':
        stringExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: stringExpression,
            name: identifiers.uuid,
          }),
        });
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    stringExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: stringExpression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      stringExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: stringExpression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      stringExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: stringExpression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  if (schema.pattern) {
    stringExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: stringExpression,
        name: identifiers.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
    });
  }

  return stringExpression;
};
