import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  let chain: ReturnType<typeof $.call>;

  const z = plugin.external('zod.z');

  if (typeof schema.const === 'boolean') {
    chain = $(z).attr(identifiers.literal).call($.literal(schema.const));
    result.expression = chain;
    return result as Omit<Ast, 'typeName'>;
  }

  chain = $(z).attr(identifiers.boolean).call();
  result.expression = chain;
  return result as Omit<Ast, 'typeName'>;
};
