import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

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
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.void,
    }),
  });
  return expression;
};
