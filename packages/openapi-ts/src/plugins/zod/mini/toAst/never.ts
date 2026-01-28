import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const neverToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'never'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.external('zod.z');
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = $(z).attr(identifiers.never).call();
  return result as Omit<Ast, 'typeName'>;
};
