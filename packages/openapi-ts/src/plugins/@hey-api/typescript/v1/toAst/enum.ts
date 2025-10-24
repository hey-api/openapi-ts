import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): ts.TypeNode => {
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
