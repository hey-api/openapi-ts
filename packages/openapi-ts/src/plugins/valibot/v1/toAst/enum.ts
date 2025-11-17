import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToAst } from './unknown';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): ReturnType<typeof $.call> => {
  const enumMembers: Array<ReturnType<typeof $.literal>> = [];

  let isNullable = false;

  for (const item of schema.items ?? []) {
    // Zod supports only string enums
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push($.literal(item.const));
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!enumMembers.length) {
    return unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  let resultExpression = $(v.placeholder)
    .attr(identifiers.schemas.picklist)
    .call($.array(...enumMembers));

  if (isNullable) {
    resultExpression = $(v.placeholder)
      .attr(identifiers.schemas.nullable)
      .call(resultExpression);
  }

  return resultExpression;
};
