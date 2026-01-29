import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Ast } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  symbol,
  typeInferSymbol,
}: {
  ast: Ast;
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: Symbol;
  typeInferSymbol: Symbol | undefined;
}): void => {
  const z = plugin.external('zod.z');

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) =>
      c.doc(v),
    )
    .$if(ast.typeName, (c, v) => c.type($.type(z).attr(v)))
    .assign(ast.expression);
  plugin.node(statement);

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type($.type(z).attr(identifiers.infer).generic($(symbol).typeofType()));
    plugin.node(inferType);
  }
};
