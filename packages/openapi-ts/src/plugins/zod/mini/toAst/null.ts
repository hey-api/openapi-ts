import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.null,
    }),
  });
  return result as Omit<Ast, 'typeName'>;
};
