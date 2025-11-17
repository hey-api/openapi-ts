import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}) => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const expression = $(v.placeholder).attr(identifiers.schemas.null).call();
  return expression;
};
