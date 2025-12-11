import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import { numberParameter } from '../../shared/numbers';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const isBigInt = schema.type === 'integer' && schema.format === 'int64';

  if (typeof schema.const === 'number') {
    // TODO: parser - handle bigint constants
    result.expression = $(z)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    return result as Omit<Ast, 'typeName'>;
  }

  result.expression = isBigInt
    ? $(z).attr(identifiers.coerce).attr(identifiers.bigint).call()
    : $(z).attr(identifiers.number).call();

  if (!isBigInt && schema.type === 'integer') {
    result.expression = $(z).attr(identifiers.int).call();
  }

  const checks: Array<ReturnType<typeof $.call>> = [];

  if (schema.exclusiveMinimum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.gt)
        .call(numberParameter({ isBigInt, value: schema.exclusiveMinimum })),
    );
  } else if (schema.minimum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.gte)
        .call(numberParameter({ isBigInt, value: schema.minimum })),
    );
  }

  if (schema.exclusiveMaximum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.lt)
        .call(numberParameter({ isBigInt, value: schema.exclusiveMaximum })),
    );
  } else if (schema.maximum !== undefined) {
    checks.push(
      $(z)
        .attr(identifiers.lte)
        .call(numberParameter({ isBigInt, value: schema.maximum })),
    );
  }

  if (checks.length) {
    result.expression = result.expression
      .attr(identifiers.check)
      .call(...checks);
  }

  return result as Omit<Ast, 'typeName'>;
};
