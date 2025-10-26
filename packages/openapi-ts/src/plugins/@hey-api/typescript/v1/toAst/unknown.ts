import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const unknownToAst = ({
  plugin,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'unknown'>;
}): ts.TypeNode => {
  const node = tsc.keywordTypeNode({
    keyword: plugin.config.topType,
  });
  return node;
};
