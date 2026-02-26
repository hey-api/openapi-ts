import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { composeMeta, defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { PydanticFinal, PydanticResult } from '../shared/types';
import type { PydanticPlugin } from '../types';
import { booleanToType } from './toAst/boolean';
import { objectToFields } from './toAst/object';

export interface VisitorConfig {
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

      let { typeAnnotation } = result;
      const fieldConstraints: Record<string, unknown> = { ...result.fieldConstraints };

      if (needsOptional || needsNullable) {
        const optional = ctx.plugin.external('typing.Optional');
        typeAnnotation = `${optional}[${typeAnnotation}]`;
        if (needsOptional) {
          fieldConstraints.default = hasDefault ? result.meta.default : null;
        }
      }

      return { fieldConstraints, fields: result.fields, typeAnnotation };
    },
    // @ts-expect-error
    array(schema, ctx) {
      return {
        fieldConstraints: {},
        meta: defaultMeta(schema),
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    boolean(schema, ctx) {
      return booleanToType({ plugin: ctx.plugin, schema });
    },
    // @ts-expect-error
    enum(schema, ctx) {
      return {
        fieldConstraints: {},
        meta: defaultMeta(schema),
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    integer(schema) {
      return { fieldConstraints: {}, meta: defaultMeta(schema), typeAnnotation: 'int' };
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
    // @ts-expect-error
    intersection(items, schemas, parentSchema, ctx) {
      return {
        fieldConstraints: {},
        meta: composeMeta(items, { default: parentSchema.default }),
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    // @ts-expect-error
    never(schema, ctx) {
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), nullable: false, readonly: false },
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    null(schema) {
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), nullable: false, readonly: false },
        typeAnnotation: 'None',
      };
    },
    number(schema) {
      return { fieldConstraints: {}, meta: defaultMeta(schema), typeAnnotation: 'float' };
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
        fieldConstraints: {},
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

      // TODO: replace string with symbol
      const refName = typeof refSymbol === 'string' ? refSymbol : refSymbol.name;
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), hasLazy: !isRegistered },
        typeAnnotation: isRegistered ? refName : `'${refName}'`,
      };
    },
    string(schema) {
      return { fieldConstraints: {}, meta: defaultMeta(schema), typeAnnotation: 'str' };
    },
    // @ts-expect-error
    tuple(schema, ctx) {
      return {
        fieldConstraints: {},
        meta: defaultMeta(schema),
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    undefined(schema) {
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), nullable: false, readonly: false },
        typeAnnotation: 'None',
      };
    },
    // @ts-expect-error
    union(items, schemas, parentSchema, ctx) {
      return {
        fieldConstraints: {},
        meta: composeMeta(items, { default: parentSchema.default }),
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    // @ts-expect-error
    unknown(schema, ctx) {
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), nullable: false, readonly: false },
        typeAnnotation: ctx.plugin.external('typing.Any'),
      };
    },
    void(schema) {
      return {
        fieldConstraints: {},
        meta: { ...defaultMeta(schema), nullable: false, readonly: false },
        typeAnnotation: 'None',
      };
    },
  };
}
