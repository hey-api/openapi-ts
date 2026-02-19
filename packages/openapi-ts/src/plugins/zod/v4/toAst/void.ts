import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export function voidToAst({
  plugin,
}: Pick<IrSchemaToAstOptions, 'plugin'> & {
  schema: SchemaWithType<'void'>;
}): Omit<Ast, 'typeName'> {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.external('zod.z');
  result.expression = $(z).attr(identifiers.void).call();
  return result as Omit<Ast, 'typeName'>;
}
