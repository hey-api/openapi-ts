import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'string') {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.literal,
      }),
      parameters: [tsc.ots.string(schema.const)],
    });
    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = tsc.callExpression({
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
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: z.placeholder,
              name: identifiers.iso,
            }),
            name: identifiers.date,
          }),
        });
        break;
      case 'date-time':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: z.placeholder,
              name: identifiers.iso,
            }),
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
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.email,
          }),
        });
        break;
      case 'ipv4':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.ipv4,
          }),
        });
        break;
      case 'ipv6':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.ipv6,
          }),
        });
        break;
      case 'time':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: tsc.propertyAccessExpression({
              expression: z.placeholder,
              name: identifiers.iso,
            }),
            name: identifiers.time,
          }),
        });
        break;
      case 'uri':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.url,
          }),
        });
        break;
      case 'uuid':
        result.expression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.uuid,
          }),
        });
        break;
    }
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minLength })],
    });
  } else {
    if (schema.minLength !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minLength })],
      });
    }

    if (schema.maxLength !== undefined) {
      result.expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: result.expression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxLength })],
      });
    }
  }

  if (schema.pattern) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.regex,
      }),
      parameters: [tsc.regularExpressionLiteral({ text: schema.pattern })],
    });
  }

  return result as Omit<Ast, 'typeName'>;
};
