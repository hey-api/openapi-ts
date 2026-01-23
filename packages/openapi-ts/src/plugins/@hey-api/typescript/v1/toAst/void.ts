import type { SchemaWithType } from '@hey-api/shared';

import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const voidToAst = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: IrSchemaToAstOptions & {
    schema: SchemaWithType<'void'>;
  },
): TypeTsDsl => {
  const node = $.type('void');
  return node;
};
