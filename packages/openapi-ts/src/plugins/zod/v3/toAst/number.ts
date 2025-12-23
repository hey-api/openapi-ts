import type { SchemaWithType } from '~/plugins';
import {
  maybeBigInt,
  shouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import { getIntegerLimit } from '~/plugins/shared/utils/formats';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}) => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (schema.const !== undefined) {
    const expression = $(z)
      .attr(identifiers.literal)
      .call(maybeBigInt(schema.const, schema.format));
    return expression;
  }

  let numberExpression: ReturnType<typeof $.call>;

  if (shouldCoerceToBigInt(schema.format)) {
    numberExpression = $(z)
      .attr(identifiers.coerce)
      .attr(identifiers.bigint)
      .call();
  } else {
    numberExpression = $(z).attr(identifiers.number).call();
    if (schema.type === 'integer') {
      numberExpression = numberExpression.attr(identifiers.int).call();
    }
  }

  let hasLowerBound = false;
  let hasUpperBound = false;

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gt)
      .call(maybeBigInt(schema.exclusiveMinimum, schema.format));
    hasLowerBound = true;
  } else if (schema.minimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gte)
      .call(maybeBigInt(schema.minimum, schema.format));
    hasLowerBound = true;
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lt)
      .call(maybeBigInt(schema.exclusiveMaximum, schema.format));
    hasUpperBound = true;
  } else if (schema.maximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lte)
      .call(maybeBigInt(schema.maximum, schema.format));
    hasUpperBound = true;
  }

  const integerLimit = getIntegerLimit(schema.format);
  if (integerLimit) {
    if (!hasLowerBound) {
      numberExpression = numberExpression
        .attr(identifiers.min)
        .call(
          maybeBigInt(integerLimit.minValue, schema.format),
          $.object().prop('message', $.literal(integerLimit.minError)),
        );
      hasLowerBound = true;
    }

    if (!hasUpperBound) {
      numberExpression = numberExpression
        .attr(identifiers.max)
        .call(
          maybeBigInt(integerLimit.maxValue, schema.format),
          $.object().prop('message', $.literal(integerLimit.maxError)),
        );
      hasUpperBound = true;
    }
  }

  return numberExpression;
};
