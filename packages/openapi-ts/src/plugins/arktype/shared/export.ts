import type { Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';

import { applyNaming, pathToName } from '@hey-api/shared';
import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../ts-dsl';
import type { ProcessorContext } from './processor';
import type { ArktypeFinal } from './types';

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
  final: ArktypeFinal;
}): void {
  const type = plugin.external('arktype.type');

  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.symbol(applyNaming(name, naming), {
    meta: {
      category: 'schema',
      path,
      tags,
      tool: 'arktype',
      ...meta,
    },
  });

  const statement = $.const(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    .$if(final.typeName, (c) => c.type($.type(type).attr(final.typeName!)))
    .assign($(type).call(final.expression));

  plugin.node(statement);
}
