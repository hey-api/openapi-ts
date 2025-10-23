import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';

export const undefinedToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'undefined'>;
}) => {
  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.undefined,
    }),
  });
  return expression;
};
