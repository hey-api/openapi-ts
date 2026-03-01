import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../py-dsl';
import { composeMeta, defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { PydanticFinal, PydanticResult } from '../shared/types';
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
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<PydanticResult, PydanticPlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result, ctx, options = {}): PydanticFinal {
      const { optional } = options;

      const hasDefault = result.meta.default !== undefined;
      const needsOptional = optional || hasDefault;
      const needsNullable = result.meta.nullable;

      let typeAnnotation = result.typeAnnotation;
      const fieldConstraints = { ...result.fieldConstraints };

      if (needsOptional || needsNullable) {
        const optionalType = ctx.plugin.external('typing.Optional');
        typeAnnotation = $(optionalType).slice(typeAnnotation ?? ctx.plugin.external('typing.Any'));
        if (needsOptional) {
          fieldConstraints.default = hasDefault ? result.meta.default : null;
        }
      }

      return {
        enumMembers: result.enumMembers,
        fieldConstraints,
        fields: result.fields,
        typeAnnotation,
      };
    },
    array(schema, ctx, walk) {
      const applyModifiers = (result: PydanticResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as PydanticFinal;

      const { childResults, fieldConstraints, typeAnnotation } = arrayToType({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        fieldConstraints,
        meta: composeMeta(childResults, { ...defaultMeta(schema) }),
        typeAnnotation,
      };
    },
    boolean(schema, ctx) {
      const result = booleanToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: defaultMeta(schema) };
    },
    enum(schema, ctx) {
      const mode = ctx.plugin.config.enums ?? 'enum';
      const result = enumToType({ mode, plugin: ctx.plugin, schema });
      return { ...result, meta: defaultMeta(schema) };
    },
    integer(schema, ctx) {
      const result = numberToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: defaultMeta(schema) };
    },
    intercept(schema, ctx, walk) {
      if (schemaExtractor && !schema.$ref) {
        const extracted = schemaExtractor({
          meta: { resource: 'definition', resourceId: pathToJsonPointer(fromRef(ctx.path)) },
          naming: ctx.plugin.config.definitions,
          path: fromRef(ctx.path),
          plugin: ctx.plugin,
          schema,
        });
        if (extracted !== schema) return walk(extracted, ctx);
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const applyModifiers = (result: PydanticResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as PydanticFinal;

      const result = intersectionToType({
        applyModifiers,
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
      });

      return {
        ...result,
        meta: composeMeta(items, { default: parentSchema.default }),
      };
    },
    never(schema, ctx) {
      const result = neverToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: { ...defaultMeta(schema), nullable: false, readonly: false } };
    },
    null(schema, ctx) {
      const result = nullToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: { ...defaultMeta(schema), nullable: true, readonly: false } };
    },
    number(schema, ctx) {
      const result = numberToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: defaultMeta(schema) };
    },
    object(schema, ctx, walk) {
      const applyModifiers = (result: PydanticResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as PydanticFinal;

      const { childResults, fields, typeAnnotation } = objectToFields({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        fields,
        meta: inheritMeta(schema, childResults),
        typeAnnotation: typeAnnotation ?? '',
      };
    },
    postProcess(result) {
      return result;
    },
    reference($ref, schema, ctx) {
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
        tool: 'pydantic',
      };

      const refSymbol = ctx.plugin.referenceSymbol(query);
      const isRegistered = ctx.plugin.isSymbolRegistered(query);

      return {
        meta: { ...defaultMeta(schema), hasForwardReference: !isRegistered },
        typeAnnotation: refSymbol,
      };
    },
    string(schema, ctx) {
      const result = stringToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: defaultMeta(schema) };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers = (result: PydanticResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as PydanticFinal;

      const { childResults, fieldConstraints, typeAnnotation } = tupleToType({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        fieldConstraints,
        meta: composeMeta(childResults, { ...defaultMeta(schema) }),
        typeAnnotation,
      };
    },
    undefined(schema, ctx) {
      const result = undefinedToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: { ...defaultMeta(schema), nullable: false, readonly: false } };
    },
    union(items, schemas, parentSchema, ctx) {
      const applyModifiers = (result: PydanticResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as PydanticFinal;

      const result = unionToType({
        applyModifiers,
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
      });

      return {
        ...result,
        meta: composeMeta(items, { default: parentSchema.default }),
      };
    },
    unknown(schema, ctx) {
      const result = unknownToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: { ...defaultMeta(schema), nullable: false, readonly: false } };
    },
    void(schema, ctx) {
      const result = voidToType({ plugin: ctx.plugin, schema });
      return { ...result, meta: { ...defaultMeta(schema), nullable: false, readonly: false } };
    },
  };
}
