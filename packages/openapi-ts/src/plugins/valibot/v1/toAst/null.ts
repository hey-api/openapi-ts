import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}) => {
  const v = plugin.external('valibot.v');
  const expression = $(v).attr(identifiers.schemas.null).call();
  return expression;
};
