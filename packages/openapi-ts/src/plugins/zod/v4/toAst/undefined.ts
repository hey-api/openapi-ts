import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.undefined,
    }),
  });
  return result as Omit<Ast, 'typeName'>;
};
