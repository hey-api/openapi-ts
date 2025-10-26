import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';

export const numberToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): ts.TypeNode => {
  if (schema.const !== undefined) {
    return tsc.literalTypeNode({
      literal: tsc.ots.number(schema.const as number),
    });
  }

  if (schema.type === 'integer' && schema.format === 'int64') {
    // TODO: parser - add ability to skip type transformers
    if (plugin.getPlugin('@hey-api/transformers')?.config.bigInt) {
      return tsc.typeReferenceNode({ typeName: 'bigint' });
    }
  }

  return tsc.keywordTypeNode({
    keyword: 'number',
  });
};
