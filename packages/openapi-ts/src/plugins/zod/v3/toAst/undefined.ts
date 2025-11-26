import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  const expression = $(z).attr(identifiers.undefined).call();
  return expression;
};
