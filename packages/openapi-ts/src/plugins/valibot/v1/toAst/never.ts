import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const neverToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'never'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.never,
    }),
  });
  return expression;
};
