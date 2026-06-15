import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../pydantic/dsl';
import { composeMeta, defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { PydanticResult } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { arrayToType } from './toAst/array';
import { booleanToType } from './toAst/boolean';
import { enumToType } from './toAst/enum';
import { intersectionToType } from './toAst/intersection';
import { neverToType } from './toAst/never';
import { nullToType } from './toAst/null';
import { numberToType } from './toAst/number';
import { objectToFields } from './toAst/object';
import { stringToType } from './toAst/string';
import { tupleToType } from './toAst/tuple';
import { undefinedToType } from './toAst/undefined';
import { unionToType } from './toAst/union';
import { unknownToType } from './toAst/unknown';
import { voidToType } from './toAst/void';

export interface VisitorConfig {
  /** The plugin instance. */
  plugin: PydanticPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<PydanticResult, PydanticPlugin['Instance']> {
  const { plugin, schemaExtractor } = config;

  return {
    applyModifiers(result): PydanticResult {
      return result;
    },
    array(schema, ctx, walk) {
      const result = arrayToType({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as PydanticResult,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        ...result,
        meta: composeMeta(result.childResults, { ...defaultMeta(schema) }),
      };
    },
    boolean(schema, ctx) {
      const result = booleanToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: defaultMeta(schema),
      };
    },
    enum(schema, ctx) {
      const result = enumToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: result.isNullable,
        },
        node: result.enumMembers.length ? { kind: 'enum', members: result.enumMembers } : undefined,
      };
    },
    integer(schema, ctx) {
      const result = numberToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: defaultMeta(schema),
      };
    },
    intercept(schema, ctx, walk) {
      if (schemaExtractor && !schema.$ref) {
        const extracted = schemaExtractor({
          meta: { resource: 'definition', resourceId: pathToJsonPointer(fromRef(ctx.path)) },
          naming: plugin.config.definitions,
          path: fromRef(ctx.path),
          plugin,
          schema,
        });
        if (extracted !== schema) return walk(extracted, ctx);
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const result = intersectionToType({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as PydanticResult,
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
      });

      return {
        ...result,
        meta: composeMeta(items, { default: parentSchema.default }),
      };
    },
    never(schema, ctx) {
      const result = neverToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    null(schema, ctx) {
      const result = nullToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: true,
          readonly: false,
        },
      };
    },
    number(schema, ctx) {
      const result = numberToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: defaultMeta(schema),
      };
    },
    object(schema, ctx, walk) {
      const result = objectToFields({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as PydanticResult,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        ...result,
        meta: inheritMeta(schema, result.childResults),
      };
    },
    postProcess(result) {
      return result;
    },
    reference($ref, schema) {
      const query: SymbolMeta = {
        artifact: 'pydantic',
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
      };
      // TODO: contract (self)
      const refSymbol = plugin.referenceSymbol(query);
      // TODO: contract (self)
      const isRegistered = plugin.isSymbolRegistered(query);
      const type = $.constrainedType(refSymbol);

      return {
        meta: {
          ...defaultMeta(schema),
          hasForwardReference: !isRegistered,
        },
        node: { kind: 'rootModel', type },
        type,
      };
    },
    string(schema, ctx) {
      const result = stringToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: defaultMeta(schema),
      };
    },
    tuple(schema, ctx, walk) {
      const result = tupleToType({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as PydanticResult,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        ...result,
        meta: composeMeta(result.childResults, { ...defaultMeta(schema) }),
      };
    },
    undefined(schema, ctx) {
      const result = undefinedToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const result = unionToType({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as PydanticResult,
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
        schemas,
      });

      return {
        ...result,
        meta: composeMeta(items, { default: parentSchema.default }),
      };
    },
    unknown(schema, ctx) {
      const result = unknownToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    void(schema, ctx) {
      const result = voidToType({ path: ctx.path, plugin, schema });
      return {
        ...result,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
  };
}
