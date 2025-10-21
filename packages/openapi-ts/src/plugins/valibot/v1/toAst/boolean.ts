import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.getSelector('external', 'valibot.v'),
  );

  if (typeof schema.const === 'boolean') {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.literal,
      }),
      parameters: [tsc.ots.boolean(schema.const)],
    });
    return expression;
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.boolean,
    }),
  });
  return expression;
};
