import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { TypeScriptResult } from '../shared/types';
import type { HeyApiTypeScriptPlugin } from '../types';
import { arrayToAst } from './toAst/array';
import { booleanToAst } from './toAst/boolean';
import { enumToAst } from './toAst/enum';
import { intersectionToAst } from './toAst/intersection';
import { neverToAst } from './toAst/never';
import { nullToAst } from './toAst/null';
import { numberToAst } from './toAst/number';
import { objectToAst } from './toAst/object';
import { stringToAst } from './toAst/string';
import { tupleToAst } from './toAst/tuple';
import { undefinedToAst } from './toAst/undefined';
import { unionToAst } from './toAst/union';
import { unknownToAst } from './toAst/unknown';
import { voidToAst } from './toAst/void';

export interface VisitorConfig {
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result) {
      return {
        enumData: result.enumData,
        type: result.type,
      };
    },
    array(schema, ctx, walk) {
      const type = arrayToAst({
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    boolean(schema, ctx) {
      const type = booleanToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    enum(schema, ctx) {
      const { enumData, type } = enumToAst({ plugin: ctx.plugin, schema });
      return {
        enumData,
        meta: defaultMeta(schema),
        type,
      };
    },
    integer(schema, ctx) {
      const type = numberToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    intercept(schema, ctx, walk) {
      if (schemaExtractor && !schema.$ref) {
        const extracted = schemaExtractor({
          meta: {
            resource: 'definition',
            resourceId: pathToJsonPointer(fromRef(ctx.path)),
          },
          naming: ctx.plugin.config.definitions,
          path: fromRef(ctx.path),
          plugin: ctx.plugin,
          schema,
        });

        if (extracted !== schema) {
          return walk(extracted, ctx);
        }
      }

      const transformersPlugin = ctx.plugin.getPlugin('@hey-api/transformers');
      if (transformersPlugin?.config.typeTransformers) {
        for (const typeTransformer of transformersPlugin.config.typeTransformers) {
          const typeNode = typeTransformer({ plugin: transformersPlugin, schema });
          if (typeNode) {
            return { meta: defaultMeta(schema), type: typeNode };
          }
        }
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const type = intersectionToAst({
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
        schemas,
      });

      return {
        meta: inheritMeta(parentSchema, items),
        type,
      };
    },
    never(schema, ctx) {
      const type = neverToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    null(schema, ctx) {
      const type = nullToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    number(schema, ctx) {
      const type = numberToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    object(schema, ctx, walk) {
      const type = objectToAst({
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    postProcess(result) {
      return result;
    },
    reference($ref, schema, ctx) {
      const symbol = ctx.plugin.referenceSymbol({
        category: 'type',
        resource: 'definition',
        resourceId: $ref,
      });

      if (schema.omit && schema.omit.length > 0) {
        const omittedKeys =
          schema.omit.length === 1
            ? $.type.literal(schema.omit[0]!)
            : $.type.or(...schema.omit.map((key) => $.type.literal(key)));
        return {
          meta: defaultMeta(schema),
          type: $.type('Omit').generics($.type(symbol), omittedKeys),
        };
      }

      return {
        meta: defaultMeta(schema),
        type: $.type(symbol),
      };
    },
    string(schema, ctx) {
      const type = stringToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    tuple(schema, ctx, walk) {
      const type = tupleToAst({
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    undefined(schema, ctx) {
      const type = undefinedToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const type = unionToAst({
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
        schemas,
      });

      return {
        meta: inheritMeta(parentSchema, items),
        type,
      };
    },
    unknown(schema, ctx) {
      const type = unknownToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
    void(schema, ctx) {
      const type = voidToAst({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        type,
      };
    },
  };
}
