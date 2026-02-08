import { applyNaming, pathToName } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { identifiers } from '../v1/constants';
import { pipesToNode } from './pipes';
import type { ProcessorContext } from './processor';
import type { Ast, IrSchemaToAstOptions } from './types';

export function exportAst({
  ast,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  state,
  tags,
}: Pick<IrSchemaToAstOptions, 'state'> &
  ProcessorContext & {
    ast: Ast;
  }): void {
  const v = plugin.external('valibot.v');

  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.symbol(applyNaming(name, naming), {
    meta: {
      category: 'schema',
      path,
      tags,
      tool: 'valibot',
      ...meta,
    },
  });

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    .$if(state.hasLazyExpression['~ref'], (c) =>
      c.type($.type(v).attr(ast.typeName || identifiers.types.GenericSchema)),
    )
    .assign(pipesToNode(ast.pipes, plugin));
  plugin.node(statement);
}
