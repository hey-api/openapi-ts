import { createSchemaProcessor, createSchemaWalker } from '@hey-api/shared';
import { fromRef } from '@hey-api/codegen-core';
import { pathToJsonPointer } from '@hey-api/shared';

import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { ArktypeFinal } from '../shared/types';
import type { ArktypePlugin } from '../types';
import { createVisitor } from './walker';

export function createProcessor(plugin: ArktypePlugin['Instance']): ProcessorResult {
  const processor = createSchemaProcessor();

  function process(ctx: ProcessorContext): ArktypeFinal | void {
    if (!processor.markEmitted(ctx.path)) return;

    return processor.withContext({ 
      anchor: ctx.namingAnchor, 
      tags: ctx.tags 
    }, () => {
      const visitor = createVisitor({ schemaExtractor: undefined });
      const walk = createSchemaWalker(visitor);

      const result = walk(ctx.schema, {
        path: ctx.path,
        plugin,
      });

      const final = visitor.applyModifiers(result, {
        path: ctx.path,
        plugin,
      });

      exportAst({ 
        final,
        meta: {
          resource: 'definition',
          resourceId: pathToJsonPointer(fromRef(ctx.path)),
        },
        naming: ctx.naming,
        namingAnchor: ctx.namingAnchor,
        path: ctx.path,
        plugin,
        schema: ctx.schema,
        tags: ctx.tags,
      });

      return final;
    });
  }

  return { process };
}