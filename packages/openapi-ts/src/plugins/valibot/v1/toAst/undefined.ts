import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  const expression = $(v).attr(identifiers.schemas.undefined).call();
  return expression;
};
