import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: IrSchemaToAstOptions & {
    schema: SchemaWithType<'null'>;
  },
): ts.TypeNode => {
  const node = tsc.literalTypeNode({
    literal: tsc.null(),
  });
  return node;
};
