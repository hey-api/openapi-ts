import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { unknownToAst } from './unknown';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const enumMembers: Array<ReturnType<typeof $.literal>> = [];
  const literalMembers: Array<ReturnType<typeof $.call>> = [];

  let isNullable = false;
  let allStrings = true;

  for (const item of schema.items ?? []) {
    // Zod supports string, number, and boolean enums
    if (item.type === 'string' && typeof item.const === 'string') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      allStrings = false;
      const literal = $.literal(item.const);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      allStrings = false;
      const literal = $.literal(item.const);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!literalMembers.length) {
    return unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  // Use z.enum() for pure string enums, z.union() for mixed or non-string types
  if (allStrings && enumMembers.length > 0) {
    result.expression = $(z)
      .attr(identifiers.enum)
      .call($.array(...enumMembers));
  } else if (literalMembers.length === 1) {
    // For single-member unions, use the member directly instead of wrapping in z.union()
    result.expression = literalMembers[0]!;
  } else {
    result.expression = $(z)
      .attr(identifiers.union)
      .call($.array(...literalMembers));
  }

  if (isNullable) {
    result.expression = $(z).attr(identifiers.nullable).call(result.expression);
  }

  return result as Omit<Ast, 'typeName'>;
};
