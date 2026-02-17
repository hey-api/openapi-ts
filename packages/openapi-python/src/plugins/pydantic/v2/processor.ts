import { refs } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import { createSchemaProcessor, pathToJsonPointer } from '@hey-api/shared';

import { exportAst } from '../shared/export';
import type { ProcessorContext, ProcessorResult } from '../shared/processor';
import type { PluginState } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { irSchemaToAst } from './plugin';

export function createProcessor(plugin: PydanticPlugin['Instance']): ProcessorResult {
  const processor = createSchemaProcessor();

  const hooks = [plugin.config['~hooks']?.schemas, plugin.context.config.parser.hooks.schemas];

  function extractor(ctx: ProcessorContext): IR.SchemaObject {
    if (processor.hasEmitted(ctx.path)) {
      return ctx.schema;
    }

    for (const hook of hooks) {
      const result = hook?.shouldExtract?.(ctx);
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
      const state = refs<PluginState>({
        hasLazyExpression: false,
        path: ctx.path,
        tags: ctx.tags,
      });

      const ast = irSchemaToAst({
        plugin,
        schema: ctx.schema,
        schemaExtractor: extractor,
        state,
      });

      exportAst({ ...ctx, ast, plugin, state });
    });
  }

  return { process };
}
