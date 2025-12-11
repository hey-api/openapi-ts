import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const neverToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'never'>;
}) => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const expression = $(v).attr(identifiers.schemas.never).call();
  return expression;
};
