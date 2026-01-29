import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { identifiers } from '../v1/constants';
import { pipesToNode } from './pipes';
import type { Ast, IrSchemaToAstOptions } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  state,
  symbol,
}: IrSchemaToAstOptions & {
  ast: Ast;
  schema: IR.SchemaObject;
  symbol: Symbol;
}): void => {
  const v = plugin.external('valibot.v');
  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    .$if(state.hasLazyExpression['~ref'], (c) =>
      c.type($.type(v).attr(ast.typeName || identifiers.types.GenericSchema)),
    )
    .assign(pipesToNode(ast.pipes, plugin));
  plugin.node(statement);
};
