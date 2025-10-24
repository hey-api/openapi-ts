import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const undefinedToAst = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: IrSchemaToAstOptions & {
    schema: SchemaWithType<'undefined'>;
  },
): ts.TypeNode => {
  const node = tsc.keywordTypeNode({
    keyword: 'undefined',
  });
  return node;
};
