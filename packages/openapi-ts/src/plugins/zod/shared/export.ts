import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { $ } from '~/ts-dsl';

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
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) =>
      c.doc(v),
    )
    .$if(ast.typeName, (c, v) => c.type($.type(z.placeholder).attr(v)))
    .assign(ast.expression);
  plugin.setSymbolValue(symbol, statement);

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type(
        $.type(z.placeholder)
          .attr(identifiers.infer)
          .generic($(symbol.placeholder).typeofType()),
      );
    plugin.setSymbolValue(typeInferSymbol, inferType);
  }
};
