import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const voidToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'void'>;
}) => {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.void).call();
  return expression;
};
