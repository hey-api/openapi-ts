import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  result.expression = $(z.placeholder).attr(identifiers.undefined).call();
  return result as Omit<Ast, 'typeName'>;
};
