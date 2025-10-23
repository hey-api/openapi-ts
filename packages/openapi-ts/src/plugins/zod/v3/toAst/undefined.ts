import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.undefined,
    }),
  });
  return expression;
};
