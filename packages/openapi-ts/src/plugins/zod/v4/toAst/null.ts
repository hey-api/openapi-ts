import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  result.expression = $(z).attr(identifiers.null).call();
  return result as Omit<Ast, 'typeName'>;
};
