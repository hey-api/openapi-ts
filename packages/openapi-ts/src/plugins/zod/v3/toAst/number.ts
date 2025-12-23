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

  const integerLimit = getIntegerLimit(schema.format);
  if (integerLimit) {
    numberExpression = numberExpression
      .attr(identifiers.min)
      .call(
        maybeBigInt(integerLimit.minValue, schema.format),
        $.object().prop('message', $.literal(integerLimit.minError)),
      )
      .attr(identifiers.max)
      .call(
        maybeBigInt(integerLimit.maxValue, schema.format),
        $.object().prop('message', $.literal(integerLimit.maxError)),
      );
  }

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gt)
      .call(maybeBigInt(schema.exclusiveMinimum, schema.format));
  } else if (schema.minimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gte)
      .call(maybeBigInt(schema.minimum, schema.format));
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lt)
      .call(maybeBigInt(schema.exclusiveMaximum, schema.format));
  } else if (schema.maximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lte)
      .call(maybeBigInt(schema.maximum, schema.format));
  }

  return numberExpression;
};
