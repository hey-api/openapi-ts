import type { SchemaWithType } from '~/plugins';
import type { CallTsDsl } from '~/ts-dsl';
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
  let chain: CallTsDsl;

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'boolean') {
    chain = $(z.placeholder)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    result.expression = chain.$render();
    return result as Omit<Ast, 'typeName'>;
  }

  chain = $(z.placeholder).attr(identifiers.boolean).call();
  result.expression = chain.$render();
  return result as Omit<Ast, 'typeName'>;
};
