import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const booleanToAst = ({
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return tsc.literalTypeNode({
      literal: tsc.ots.boolean(schema.const as boolean),
    });
  }

  return tsc.keywordTypeNode({
    keyword: 'boolean',
  });
};
