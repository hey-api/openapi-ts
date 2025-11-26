import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import {
  INTEGER_FORMATS,
  isIntegerFormat,
  needsBigIntForFormat,
  numberParameter,
} from '../../shared/numbers';
import { pipesToAst } from '../../shared/pipesToAst';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

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

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  // Return early if const is defined since we can create a literal type directly without additional validation
  if (schema.const !== undefined && schema.const !== null) {
    const constValue = schema.const;
    let literalValue: ReturnType<typeof $.fromValue>;

    // Case 1: Number with no format -> generate literal with the number
    if (typeof constValue === 'number' && !format) {
      literalValue = $.literal(constValue);
    }
    // Case 2: Number with format -> check if format needs BigInt, generate appropriate literal
    else if (typeof constValue === 'number' && format) {
      if (isBigInt) {
        // Format requires BigInt, convert number to BigInt
        literalValue = $('BigInt').call($.literal(constValue));
      } else {
        // Regular format, use number as-is
        literalValue = $.literal(constValue);
      }
    }
    // Case 3: Format that allows string -> generate BigInt literal (for int64/uint64 formats)
    else if (typeof constValue === 'string' && isBigInt) {
      // Remove 'n' suffix if present in string
      const cleanString = constValue.endsWith('n')
        ? constValue.slice(0, -1)
        : constValue;
      literalValue = $('BigInt').call($.literal(cleanString));
    }
    // Case 4: Const is typeof bigint (literal) -> transform from literal to BigInt()
    else if (typeof constValue === 'bigint') {
      // Convert BigInt to string and remove 'n' suffix that toString() adds
      const bigintString = constValue.toString();
      const cleanString = bigintString.endsWith('n')
        ? bigintString.slice(0, -1)
        : bigintString;
      literalValue = $('BigInt').call($.literal(cleanString));
    }
    // Default case: use value as-is for other types
    else {
      literalValue = $.fromValue(constValue);
    }

    return $(v).attr(identifiers.schemas.literal).call(literalValue);
  }

  const pipes: Array<ReturnType<typeof $.call>> = [];

  // For bigint formats (int64, uint64), create union of number, string, and bigint with transform
  if (isBigInt) {
    const unionExpression = $(v)
      .attr(identifiers.schemas.union)
      .call(
        $.array(
          $(v).attr(identifiers.schemas.number).call(),
          $(v).attr(identifiers.schemas.string).call(),
          $(v).attr(identifiers.schemas.bigInt).call(),
        ),
      );
    pipes.push(unionExpression);

    // Add transform to convert to BigInt
    const transformExpression = $(v)
      .attr(identifiers.actions.transform)
      .call($.func().param('x').do($('BigInt').call('x').return()));
    pipes.push(transformExpression);
  } else {
    // For regular number formats, use number schema
    const expression = $(v).attr(identifiers.schemas.number).call();
    pipes.push(expression);
  }

  // Add integer validation for integer types (except when using bigint union)
  if (!isBigInt && isInteger) {
    const expression = $(v).attr(identifiers.actions.integer).call();
    pipes.push(expression);
  }

  // Add format-specific range validations
  if (formatInfo) {
    const minValue = formatInfo.min;
    const maxValue = formatInfo.max;
    const minErrorMessage = formatInfo.minError;
    const maxErrorMessage = formatInfo.maxError;

    // Add minimum value validation
    const minExpression = $(v)
      .attr(identifiers.actions.minValue)
      .call(
        isBigInt ? $('BigInt').call($.literal(minValue)) : $.literal(minValue),
        $.literal(minErrorMessage),
      );
    pipes.push(minExpression);

    // Add maximum value validation
    const maxExpression = $(v)
      .attr(identifiers.actions.maxValue)
      .call(
        isBigInt ? $('BigInt').call($.literal(maxValue)) : $.literal(maxValue),
        $.literal(maxErrorMessage),
      );
    pipes.push(maxExpression);
  }

  if (schema.exclusiveMinimum !== undefined) {
    const expression = $(v)
      .attr(identifiers.actions.gtValue)
      .call(numberParameter({ isBigInt, value: schema.exclusiveMinimum }));
    pipes.push(expression);
  } else if (schema.minimum !== undefined) {
    const expression = $(v)
      .attr(identifiers.actions.minValue)
      .call(numberParameter({ isBigInt, value: schema.minimum }));
    pipes.push(expression);
  }

  if (schema.exclusiveMaximum !== undefined) {
    const expression = $(v)
      .attr(identifiers.actions.ltValue)
      .call(numberParameter({ isBigInt, value: schema.exclusiveMaximum }));
    pipes.push(expression);
  } else if (schema.maximum !== undefined) {
    const expression = $(v)
      .attr(identifiers.actions.maxValue)
      .call(numberParameter({ isBigInt, value: schema.maximum }));
    pipes.push(expression);
  }

  return pipesToAst({ pipes, plugin });
};
