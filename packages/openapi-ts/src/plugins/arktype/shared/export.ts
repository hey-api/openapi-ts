import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { $ } from '~/ts-dsl';

import { identifiers } from '../constants';
import type { ArktypePlugin } from '../types';
import type { Ast } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  symbol,
  typeInferSymbol,
}: {
  ast: Ast;
  plugin: ArktypePlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: Symbol;
  typeInferSymbol: Symbol | undefined;
}): void => {
  const type = plugin.external('arktype.type');

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) =>
      c.doc(v),
    )
    // .type(
    //   ast.typeName
    //     ? (tsc.propertyAccessExpression({
    //         expression: z,
    //         name: ast.typeName,
    //       }) as unknown as ts.TypeNode)
    //     : undefined,
    // )
    .assign($(type).call(ast.def ? $.literal(ast.def) : ast.expression));
  plugin.node(statement);

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type($.type(symbol).attr(identifiers.type.infer).typeofType());
    plugin.node(inferType);
  }
};
