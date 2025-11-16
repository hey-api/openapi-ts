import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import { numberParameter } from '../../shared/numbers';
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

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    const expression = $(z.placeholder)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    return expression;
  }

  let numberExpression = isBigInt
    ? $(z.placeholder).attr(identifiers.coerce).attr(identifiers.bigint).call()
    : $(z.placeholder).attr(identifiers.number).call();

  if (!isBigInt && schema.type === 'integer') {
    numberExpression = numberExpression.attr(identifiers.int).call();
  }

  if (schema.exclusiveMinimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gt)
      .call(numberParameter({ isBigInt, value: schema.exclusiveMinimum }));
  } else if (schema.minimum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.gte)
      .call(numberParameter({ isBigInt, value: schema.minimum }));
  }

  if (schema.exclusiveMaximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lt)
      .call(numberParameter({ isBigInt, value: schema.exclusiveMaximum }));
  } else if (schema.maximum !== undefined) {
    numberExpression = numberExpression
      .attr(identifiers.lte)
      .call(numberParameter({ isBigInt, value: schema.maximum }));
  }

  return numberExpression;
};
