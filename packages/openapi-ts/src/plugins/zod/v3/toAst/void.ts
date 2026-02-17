import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export function voidToAst({
  plugin,
}: Pick<IrSchemaToAstOptions, 'plugin'> & {
  schema: SchemaWithType<'void'>;
}) {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.void).call();
  return expression;
}
