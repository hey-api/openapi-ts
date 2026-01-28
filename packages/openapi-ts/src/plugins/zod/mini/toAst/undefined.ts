import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.external('zod.z');
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = $(z).attr(identifiers.undefined).call();
  return result as Omit<Ast, 'typeName'>;
};
