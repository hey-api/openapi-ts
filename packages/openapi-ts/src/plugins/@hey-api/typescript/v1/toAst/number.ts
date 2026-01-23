import type { SchemaWithType } from '@hey-api/shared';

import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): TypeTsDsl => {
  if (schema.const !== undefined) {
    return $.type.literal(schema.const as number);
  }

  if (schema.type === 'integer' && schema.format === 'int64') {
    // TODO: parser - add ability to skip type transformers
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return $.type('bigint');
    }
  }

  return $.type('number');
};
