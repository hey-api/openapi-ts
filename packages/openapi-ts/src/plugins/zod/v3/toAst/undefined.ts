import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export function undefinedToAst({
  plugin,
}: Pick<IrSchemaToAstOptions, 'plugin'> & {
  schema: SchemaWithType<'undefined'>;
}) {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.undefined).call();
  return expression;
}
