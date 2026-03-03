import { ref } from '@hey-api/codegen-core';
import type { Hooks, IR } from '@hey-api/shared';
import { createSchemaProcessor, createSchemaWalker, pathToJsonPointer } from '@hey-api/shared';

import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { PydanticFinal } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { createVisitor } from './walker';

export function createProcessor(plugin: PydanticPlugin['Instance']): ProcessorResult {
  const processor = createSchemaProcessor();

  const extractorHooks: ReadonlyArray<NonNullable<Hooks['schemas']>['shouldExtract']> = [
    (ctx) =>
      ctx.schema.type === 'object' &&
      ctx.schema.properties !== undefined &&
      Object.keys(ctx.schema.properties).length > 0,
    (ctx) =>
      ctx.schema.type === 'enum' && ctx.schema.items !== undefined && ctx.schema.items.length > 0,
    plugin.config['~hooks']?.schemas?.shouldExtract,
    plugin.context.config.parser.hooks.schemas?.shouldExtract,
  ];

  function extractor(ctx: ProcessorContext): IR.SchemaObject {
    if (processor.hasEmitted(ctx.path)) {
      return ctx.schema;
    }

    for (const hook of extractorHooks) {
      const result = hook?.(ctx);
      if (result) {
        process({
          namingAnchor: processor.context.anchor,
          tags: processor.context.tags,
          ...ctx,
        });
        return { $ref: pathToJsonPointer(ctx.path) };
      }
    }

    return ctx.schema;
  }

  function process(ctx: ProcessorContext): void {
    if (!processor.markEmitted(ctx.path)) return;

    processor.withContext({ anchor: ctx.namingAnchor, tags: ctx.tags }, () => {
      const visitor = createVisitor({ schemaExtractor: extractor });
      const walk = createSchemaWalker(visitor);

      const result = walk(ctx.schema, {
        path: ref(ctx.path),
        plugin,
      });

      const final = visitor.applyModifiers(result, {
        path: ref(ctx.path),
        plugin,
      }) as PydanticFinal;

      exportAst({ ...ctx, final, plugin });
    });
  }

  return { process };
}
