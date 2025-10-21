import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.getSelector('external', 'valibot.v'),
  );

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.undefined,
    }),
  });
  return expression;
};
