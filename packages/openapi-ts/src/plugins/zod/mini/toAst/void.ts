import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const voidToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'void'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.void,
    }),
  });
  return result as Omit<Ast, 'typeName'>;
};
