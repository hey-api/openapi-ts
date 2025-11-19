import type { SchemaWithType } from '~/plugins';
import type { MaybeTsDsl, TypeTsDsl } from '~/ts-dsl';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): MaybeTsDsl<TypeTsDsl> => {
  const type = irSchemaToAst({
    plugin,
    schema: {
      ...schema,
      type: undefined,
    },
    state,
  });
  return type;
};
