import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const neverToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'never'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.never,
    }),
  });
  return result as Omit<Ast, 'typeName'>;
};
