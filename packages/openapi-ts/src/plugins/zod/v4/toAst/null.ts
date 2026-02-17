import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export function nullToAst({
  plugin,
}: Pick<IrSchemaToAstOptions, 'plugin'> & {
  schema: SchemaWithType<'null'>;
}): Omit<Ast, 'typeName'> {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.external('zod.z');
  result.expression = $(z).attr(identifiers.null).call();
  return result as Omit<Ast, 'typeName'>;
}
