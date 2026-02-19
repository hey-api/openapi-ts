import { applyNaming, pathToName } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
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
  const z = plugin.external('zod.z');

  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.symbol(applyNaming(name, naming), {
    meta: {
      category: 'schema',
      path,
      tags,
      tool: 'zod',
      ...meta,
    },
  });

  const typeInferSymbol = naming.types.infer.enabled
    ? plugin.symbol(applyNaming(name, naming.types.infer), {
        meta: {
          category: 'type',
          path,
          tags,
          tool: 'zod',
          variant: 'infer',
          ...meta,
        },
      })
    : undefined;

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    .$if(state.hasLazyExpression['~ref'] && state.anyType?.['~ref'], (c, v) =>
      c.type($.type(z).attr(v)),
    )
    .assign(ast.expression);
  plugin.node(statement);

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type($.type(z).attr(identifiers.infer).generic($(symbol).typeofType()));
    plugin.node(inferType);
  }
}
