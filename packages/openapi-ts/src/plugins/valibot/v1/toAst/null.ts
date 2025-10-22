import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const nullToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'null'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.null,
    }),
  });
  return expression;
};
