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

  const statement = $.const(symbol.placeholder)
    .export(symbol.exported)
    .$if(plugin.config.comments && createSchemaComment({ schema }), (c, v) =>
      c.describe(v as ReadonlyArray<string>),
    )
    .$if(state.hasLazyExpression.value, (c) =>
      c.type(
        $.type(v.placeholder).attr(
          ast.typeName || identifiers.types.GenericSchema.text,
        ),
      ),
    )
    .assign(pipesToAst({ pipes: ast.pipes, plugin }));
  plugin.setSymbolValue(symbol, statement);
};
