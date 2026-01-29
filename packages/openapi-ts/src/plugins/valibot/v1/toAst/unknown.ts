import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const unknownToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'unknown'>;
}) => {
  const v = plugin.external('valibot.v');
  const expression = $(v).attr(identifiers.schemas.unknown).call();
  return expression;
};
