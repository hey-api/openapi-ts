import type { Symbol } from '@hey-api/codegen-core';
import { buildSymbolIn, pathToName } from '@hey-api/shared';

import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import { pipesToNode } from './pipes';
import type { ProcessorContext } from './processor';
import type { ValibotFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  tags,
}: Pick<
  ProcessorContext,
  'meta' | 'naming' | 'namingAnchor' | 'path' | 'plugin' | 'schema' | 'tags'
> & {
  final: ValibotFinal;
}): Symbol {
  const v = plugin.external('valibot.v');

  const name = pathToName(path, { anchor: namingAnchor });

  const symbol = plugin.registerSymbol(
    buildSymbolIn({
      meta: {
        category: 'schema',
        path,
        tags,
        tool: 'valibot',
        ...meta,
      },
      name,
      naming,
      plugin,
      schema,
    }),
  );

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    .$if(final.typeName, (c) => c.type($.type(v).attr(final.typeName!)))
    .assign(pipesToNode(final.pipes, plugin));

  plugin.node(statement);

  return symbol;
}
