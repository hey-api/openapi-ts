import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.external('zod.z');
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = $(z).attr(identifiers.null).call();
  return result as Omit<Ast, 'typeName'>;
};
