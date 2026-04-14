import type { Symbol } from '@hey-api/codegen-core';
import { buildSymbolIn, pathToName } from '@hey-api/shared';

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
}: Pick<ProcessorContext, 'naming' | 'namingAnchor' | 'path' | 'plugin' | 'schema' | 'tags'> & {
  final: ZodFinal;
  meta?: Record<string, unknown>;
}): Symbol {
  const z = plugin.external('zod.z');

  const name = pathToName(path, { anchor: namingAnchor });

  const symbol = plugin.registerSymbol(
    buildSymbolIn({
      meta: {
        category: 'schema',
        path,
        tags,
        tool: 'zod',
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
    .$if(final.typeName, (c) => c.type($.type(z).attr(final.typeName!)))
    .assign(final.expression);
  plugin.node(statement);

  const typeInferSymbol = naming.types.infer.enabled
    ? plugin.registerSymbol(
        buildSymbolIn({
          meta: {
            category: 'type',
            path,
            tags,
            tool: 'zod',
            variant: 'infer',
            ...meta,
          },
          name,
          naming: naming.types.infer,
          plugin,
          schema,
        }),
      )
    : undefined;

  if (typeInferSymbol) {
    const inferType = $.type
      .alias(typeInferSymbol)
      .export()
      .type($.type(z).attr(identifiers.infer).generic($(symbol).typeofType()));
    plugin.node(inferType);
  }

  const typeInputSymbol = naming.types.input.enabled
    ? plugin.registerSymbol(
        buildSymbolIn({
          meta: {
            category: 'type',
            path,
            tags,
            tool: 'zod',
            variant: 'input',
            ...meta,
          },
          name,
          naming: naming.types.input,
          plugin,
          schema,
        }),
      )
    : undefined;

  if (typeInputSymbol) {
    const inputType = $.type
      .alias(typeInputSymbol)
      .export()
      .type($.type(z).attr(identifiers.input).generic($(symbol).typeofType()));
    plugin.node(inputType);
  }

  const typeOutputSymbol = naming.types.output.enabled
    ? plugin.registerSymbol(
        buildSymbolIn({
          meta: {
            category: 'type',
            path,
            tags,
            tool: 'zod',
            variant: 'output',
            ...meta,
          },
          name,
          naming: naming.types.output,
          plugin,
          schema,
        }),
      )
    : undefined;

  if (typeOutputSymbol) {
    const outputType = $.type
      .alias(typeOutputSymbol)
      .export()
      .type($.type(z).attr(identifiers.output).generic($(symbol).typeofType()));
    plugin.node(outputType);
  }

  return symbol;
}
