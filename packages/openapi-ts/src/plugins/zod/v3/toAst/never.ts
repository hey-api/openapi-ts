import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const neverToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'never'>;
}) => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.never,
    }),
  });
  return expression;
};
