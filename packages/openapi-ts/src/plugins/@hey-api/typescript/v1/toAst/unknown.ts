import type { SchemaWithType } from '~/plugins';
import type { TypeTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const unknownToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'unknown'>;
}): TypeTsDsl => {
  const node = $.type(plugin.config.topType);
  return node;
};
