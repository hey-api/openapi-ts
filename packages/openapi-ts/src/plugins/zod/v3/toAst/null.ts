import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export function nullToAst({
  plugin,
}: Pick<IrSchemaToAstOptions, 'plugin'> & {
  schema: SchemaWithType<'null'>;
}) {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.null).call();
  return expression;
}
