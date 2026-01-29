import type { SchemaWithType } from '@hey-api/shared';

import type { TypeTsDsl } from '../../../../../ts-dsl';
import { $ } from '../../../../../ts-dsl';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const booleanToAst = ({
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): TypeTsDsl => {
  if (schema.const !== undefined) {
    return $.type.literal(schema.const as boolean);
  }

  return $.type('boolean');
};
