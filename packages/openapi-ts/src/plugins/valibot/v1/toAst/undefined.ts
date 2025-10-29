import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.undefined,
    }),
  });
  return expression;
};
