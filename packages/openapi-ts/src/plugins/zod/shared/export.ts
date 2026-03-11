import { applyNaming, pathToName } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { identifiers } from '../constants';
import type { ProcessorContext } from './processor';
import type { ZodFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  tags,
}: ProcessorContext & {
  final: ZodFinal;
  meta?: Record<string, unknown>;
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
    .$if(final.typeName, (c) => c.type($.type(z).attr(final.typeName!)))
    .assign(final.expression);
  plugin.node(statement);

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type($.type(z).attr(identifiers.infer).generic($(symbol).typeofType()));
    plugin.node(inferType);
  }
}
