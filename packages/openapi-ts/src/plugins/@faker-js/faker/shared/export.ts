import { log } from '@hey-api/codegen-core';
import { buildSymbolIn, pathToName } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ProcessorContext } from './processor';
import type { FakerResult } from './types';

export function exportAst({
  final,
  isCircularSchema,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  tags,
}: ProcessorContext & {
  final: FakerResult;
  isCircularSchema?: boolean;
}): void {
  const name = pathToName(path, { anchor: namingAnchor });
  const symbolIn = buildSymbolIn({
    meta: {
      category: 'schema',
      path,
      tags,
      ...meta,
    },
    name,
    naming,
    plugin,
    schema,
  });

  if (final.resultType === 'never') {
    log.warn(
      `[${plugin.name}] ${symbolIn.name} not generated because we can't produce data that fits its schema.`,
    );
    return;
  }

  const symbol = plugin.symbol(symbolIn);

  // Look up the TypeScript type for this schema (e.g. Foo, Bar, or PostFooResponse)
  const typeSymbol = plugin.querySymbol({
    artifact: 'types',
    category: 'type',
    resource: meta.resource,
    resourceId: meta.resourceId,
    ...(meta.role ? { role: meta.role } : undefined),
  });

  // Build arrow function, only adding options param when the expression uses faker.
  // When usesAccessor is true, emit a block body: const f = options?.faker ?? faker; return <expr>;
  const arrowFn = $.func()
    .arrow()
    .$if(final.usesFaker, (f) => {
      if (isCircularSchema) {
        return f
          .param('options', (p) => p.type('Options').assign($.object()))
          .param('_callDepth', (p) => p.assign($.literal(0)));
      }
      return f.param('options', (p) => p.optional().type('Options'));
    })
    .$if(typeSymbol, (f) => f.returns($.type(typeSymbol!)))
    .$if(
      final.usesAccessor,
      (f) => {
        const fDecl = $.const('f').assign(
          $.binary($('options').attr('faker').optional(), '??', $(plugin.imports.faker)),
        );
        return f.do(fDecl, $.return(final.expression));
      },
      (f) => f.do($.return(final.expression)),
    );

  const statement = $.const(symbol).export().assign(arrowFn);

  plugin.node(statement);
}
