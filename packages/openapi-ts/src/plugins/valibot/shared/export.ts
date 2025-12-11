import type { Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { $ } from '~/ts-dsl';

import { identifiers } from '../v1/constants';
import { pipesToAst } from './pipesToAst';
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
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) =>
      c.doc(v),
    )
    .$if(state.hasLazyExpression['~ref'], (c) =>
      c.type($.type(v).attr(ast.typeName || identifiers.types.GenericSchema)),
    )
    .assign(pipesToAst({ pipes: ast.pipes, plugin }));
  plugin.node(statement);
};
