import type ts from 'typescript';

import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import {
  INTEGER_FORMATS,
  isIntegerFormat,
  needsBigIntForFormat,
  numberParameter,
} from '../../shared/numbers';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { pipesToAst } from '../pipesToAst';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const format = schema.format;
  const isInteger = schema.type === 'integer';
  const isBigInt = needsBigIntForFormat(format);
  const formatInfo = isIntegerFormat(format) ? INTEGER_FORMATS[format] : null;

  const v = plugin.referenceSymbol(
    plugin.api.getSelector('external', 'valibot.v'),
  );

  // Return early if const is defined since we can create a literal type directly without additional validation
  if (schema.const !== undefined && schema.const !== null) {
    const constValue = schema.const;
    let literalValue;

    // Case 1: Number with no format -> generate literal with the number
    if (typeof constValue === 'number' && !format) {
      literalValue = tsc.ots.number(constValue);
    }
    // Case 2: Number with format -> check if format needs BigInt, generate appropriate literal
    else if (typeof constValue === 'number' && format) {
      if (isBigInt) {
        // Format requires BigInt, convert number to BigInt
        literalValue = tsc.callExpression({
          functionName: 'BigInt',
          parameters: [tsc.ots.string(constValue.toString())],
        });
      } else {
        // Regular format, use number as-is
        literalValue = tsc.ots.number(constValue);
      }
    }
    // Case 3: Format that allows string -> generate BigInt literal (for int64/uint64 formats)
    else if (typeof constValue === 'string' && isBigInt) {
      // Remove 'n' suffix if present in string
      const cleanString = constValue.endsWith('n')
        ? constValue.slice(0, -1)
        : constValue;
      literalValue = tsc.callExpression({
        functionName: 'BigInt',
        parameters: [tsc.ots.string(cleanString)],
      });
    }
    // Case 4: Const is typeof bigint (literal) -> transform from literal to BigInt()
    else if (typeof constValue === 'bigint') {
      // Convert BigInt to string and remove 'n' suffix that toString() adds
      const bigintString = constValue.toString();
      const cleanString = bigintString.endsWith('n')
        ? bigintString.slice(0, -1)
        : bigintString;
      literalValue = tsc.callExpression({
        functionName: 'BigInt',
        parameters: [tsc.ots.string(cleanString)],
      });
    }
    // Default case: use value as-is for other types
    else {
      literalValue = tsc.valueToExpression({ value: constValue });
    }

    return tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.literal,
      }),
      parameters: [literalValue],
    });
  }

  const pipes: Array<ts.CallExpression> = [];

  // For bigint formats (int64, uint64), create union of number, string, and bigint with transform
  if (isBigInt) {
    const unionExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.union,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: [
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: v.placeholder,
                name: identifiers.schemas.number,
              }),
            }),
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: v.placeholder,
                name: identifiers.schemas.string,
              }),
            }),
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: v.placeholder,
                name: identifiers.schemas.bigInt,
              }),
            }),
          ],
          multiLine: false,
        }),
      ],
    });
    pipes.push(unionExpression);

    // Add transform to convert to BigInt
    const transformExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.transform,
      }),
      parameters: [
        tsc.arrowFunction({
          parameters: [{ name: 'x' }],
          statements: tsc.callExpression({
            functionName: 'BigInt',
            parameters: [tsc.identifier({ text: 'x' })],
          }),
        }),
      ],
    });
    pipes.push(transformExpression);
  } else {
    // For regular number formats, use number schema
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.number,
      }),
    });
    pipes.push(expression);
  }

  // Add integer validation for integer types (except when using bigint union)
  if (!isBigInt && isInteger) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.integer,
      }),
    });
    pipes.push(expression);
  }

  // Add format-specific range validations
  if (formatInfo) {
    const minValue = formatInfo.min;
    const maxValue = formatInfo.max;
    const minErrorMessage = formatInfo.minError;
    const maxErrorMessage = formatInfo.maxError;

    // Add minimum value validation
    const minExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.minValue,
      }),
      parameters: [
        isBigInt
          ? tsc.callExpression({
              functionName: 'BigInt',
              parameters: [tsc.ots.string(minValue.toString())],
            })
          : tsc.ots.number(minValue as number),
        tsc.ots.string(minErrorMessage),
      ],
    });
    pipes.push(minExpression);

    // Add maximum value validation
    const maxExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.maxValue,
      }),
      parameters: [
        isBigInt
          ? tsc.callExpression({
              functionName: 'BigInt',
              parameters: [tsc.ots.string(maxValue.toString())],
            })
          : tsc.ots.number(maxValue as number),
        tsc.ots.string(maxErrorMessage),
      ],
    });
    pipes.push(maxExpression);
  }

  if (schema.exclusiveMinimum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.gtValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMinimum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.minimum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.minValue,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.minimum })],
    });
    pipes.push(expression);
  }

  if (schema.exclusiveMaximum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.ltValue,
      }),
      parameters: [
        numberParameter({ isBigInt, value: schema.exclusiveMaximum }),
      ],
    });
    pipes.push(expression);
  } else if (schema.maximum !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.maxValue,
      }),
      parameters: [numberParameter({ isBigInt, value: schema.maximum })],
    });
    pipes.push(expression);
  }

  return pipesToAst({ pipes, plugin });
};
