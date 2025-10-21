import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.getSelector('external', 'zod.z'));
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.undefined,
    }),
  });
  return result as Omit<Ast, 'typeName'>;
};
