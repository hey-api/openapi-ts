import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}) => {
  const z = plugin.external('zod.z');
  const expression = $(z).attr(identifiers.null).call();
  return expression;
};
