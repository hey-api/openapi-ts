import type { SchemaWithType } from '~/plugins';
import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: IrSchemaToAstOptions & {
    schema: SchemaWithType<'null'>;
  },
): TypeTsDsl => {
  const node = $.type.literal(null);
  return node;
};
