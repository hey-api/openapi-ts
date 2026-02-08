import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export function voidToAst({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'void'>;
}) {
  const v = plugin.external('valibot.v');
  const expression = $(v).attr(identifiers.schemas.void).call();
  return expression;
}
