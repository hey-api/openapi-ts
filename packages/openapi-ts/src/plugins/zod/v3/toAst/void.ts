import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const voidToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'void'>;
}) => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  const expression = $(z).attr(identifiers.void).call();
  return expression;
};
