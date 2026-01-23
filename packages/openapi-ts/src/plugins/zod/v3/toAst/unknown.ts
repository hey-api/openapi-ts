import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const unknownToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'unknown'>;
}) => {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.unknown).call();
  return expression;
};
