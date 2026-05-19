import { buildSymbolIn, pathToName } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { createSchemaComment } from '../../../../plugins/shared/utils/schema';
import { $ } from '../../../../ts-dsl';
import { exportEnumAst } from './enum';
import type { ProcessorContext } from './processor';
import type { TypeScriptFinal } from './types';

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
  final: TypeScriptFinal;
}): void {
  const $ref = meta.resourceId || pathToJsonPointer(path);
  const name = pathToName(path, { anchor: namingAnchor });

  if (
    exportEnumAst({
      enumData: final.enumData,
      name,
      plugin,
      resourceId: $ref,
      schema,
    })
  ) {
    return;
  }

  const symbol = plugin.registerSymbol(
    buildSymbolIn({
      meta: {
        category: 'type',
        path,
        resource: 'definition',
        resourceId: $ref,
        tags,
        tool: 'typescript',
      },
      name,
      naming,
      plugin,
      schema,
    }),
  );

  const node = $.type
    .alias(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (t, v) => t.doc(v))
    .type(final.type);
  plugin.node(node);
}
