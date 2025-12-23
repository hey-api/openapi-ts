import type { SchemaWithType } from '~/plugins';
import {
  maybeBigInt,
  shouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import { getIntegerLimit } from '~/plugins/shared/utils/formats';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (schema.const !== undefined) {
    result.expression = $(z)
      .attr(identifiers.literal)
      .call(maybeBigInt(schema.const, schema.format));
    return result as Omit<Ast, 'typeName'>;
  }

  if (shouldCoerceToBigInt(schema.format)) {
    result.expression = $(z)
      .attr(identifiers.coerce)
      .attr(identifiers.bigint)
      .call();
  } else {
    result.expression = $(z).attr(identifiers.number).call();
    if (schema.type === 'integer') {
      result.expression = $(z).attr(identifiers.int).call();
    }
  }

  const checks: Array<ReturnType<typeof $.call>> = [];

  const integerLimit = getIntegerLimit(schema.format);
  if (integerLimit) {
    checks.push(
      $(z)
        .attr(identifiers.minimum)
        .call(
          maybeBigInt(integerLimit.minValue, schema.format),
          $.object().prop('error', $.literal(integerLimit.minError)),
        ),
      $(z)
        .attr(identifiers.maximum)
        .call(
          maybeBigInt(integerLimit.maxValue, schema.format),
          $.object().prop('error', $.literal(integerLimit.maxError)),
        ),
    );
  }

  if (schema.exclusiveMinimum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.gt)
        .call(maybeBigInt(schema.exclusiveMinimum, schema.format)),
    );
  } else if (schema.minimum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.gte)
        .call(maybeBigInt(schema.minimum, schema.format)),
    );
  }

  if (schema.exclusiveMaximum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.lt)
        .call(maybeBigInt(schema.exclusiveMaximum, schema.format)),
    );
  } else if (schema.maximum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.lte)
        .call(maybeBigInt(schema.maximum, schema.format)),
    );
  }

  if (checks.length) {
    result.expression = result.expression
      .attr(identifiers.check)
      .call(...checks);
  }

  return result as Omit<Ast, 'typeName'>;
};
