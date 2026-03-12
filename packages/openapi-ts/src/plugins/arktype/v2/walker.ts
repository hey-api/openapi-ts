import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor, Walker } from '@hey-api/shared';
import { deduplicateSchema, pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { composeMeta, defaultMeta, getDefaultValue, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { ArktypeFinal, ArktypeMeta, ArktypeResult } from '../shared/types';
import type { ArktypePlugin } from '../types';
import type { Resolvers } from '../resolvers';
import { identifiers } from './constants';
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
import { unknownToAst } from './toAst/unknown';
import { voidToAst } from './toAst/void';

export interface VisitorConfig {
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ArktypeResult, ArktypePlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result, ctx, options = {}): ArktypeFinal {
      const { optional } = options;
      const type = ctx.plugin.external('arktype.type');
      const def = result.def;
      const expression = result.expression;

      // Handle readonly (type-level only in Arktype)
      let finalExpression = expression;
      let finalDef = def;
      let finalTypeName: string | undefined;

      if (result.meta.readonly) {
        // Arktype readonly is type-level only, we'll add it as a type annotation
        // For now, we'll mark that we need a type annotation
        finalTypeName = 'readonly'; // TODO: Proper readonly handling
      }

      const hasDefault = result.meta.default !== undefined;
      const needsOptional = optional || hasDefault;
      const needsNullable = result.meta.nullable;

      // Handle optional + nullable combinations for string syntax
      if (needsOptional && needsNullable && def !== undefined) {
        if (hasDefault) {
          finalDef = `${def} | null = ${getDefaultValue(result.meta)}`;
        } else {
          finalDef = `${def} | null`;
        }
        // Clear expression since we're using def
        finalExpression = $.literal(finalDef!);
      } else if (needsOptional && def !== undefined) {
        if (hasDefault) {
          finalDef = `${def} = ${getDefaultValue(result.meta)}`;
        } else {
          // Optional is handled by the property key in object syntax (?)
          // For top-level, we need to wrap in optional()
          finalExpression = $(type).attr('optional').call(expression, $.literal(getDefaultValue(result.meta)));
        }
      } else if (needsNullable && def !== undefined) {
        finalDef = `${def} | null`;
        finalExpression = $.literal(finalDef!);
      } else if (needsOptional || needsNullable) {
        // For non-string types or complex types, use fluent API
        let wrapped = expression;
        if (hasDefault) {
          const defaultValue = getDefaultValue(result.meta);
          if (needsOptional && needsNullable) {
            wrapped = $(type).attr('nullish').call(wrapped, $.literal(defaultValue));
          } else if (needsOptional) {
            wrapped = $(type).attr('optional').call(wrapped, $.literal(defaultValue));
          } else if (needsNullable) {
            wrapped = $(type).attr('nullable').call(wrapped);
          }
        } else {
          if (needsOptional && needsNullable) {
            wrapped = $(type).attr('nullish').call(wrapped);
          } else if (needsOptional) {
            wrapped = $(type).attr('optional').call(wrapped);
          } else if (needsNullable) {
            wrapped = $(type).attr('nullable').call(wrapped);
          }
        }
        finalExpression = wrapped;
      }

      // Set typeName for circular references or when needed
      if (result.meta.hasLazy || result.meta.hasCircular) {
        finalTypeName = 'unknown'; // Arktype doesn't have GenericSchema, use unknown for complex cases
      }

      return {
        expression: finalExpression,
        typeName: finalTypeName,
      };
    },
    array(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof arrayToAst>[0]['applyModifiers'] = (
        result,
        opts,
      ) => this.applyModifiers(result, ctx, opts) as ArktypeFinal;

      const { def, expression } = arrayToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        def,
        expression,
        meta: inheritMeta(schema, [{ def, expression, meta: defaultMeta(schema) } as ArktypeResult]),
      };
    },
    boolean(schema, ctx) {
      const { def, expression } = booleanToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: defaultMeta(schema),
      };
    },
    enum(schema, ctx) {
      const { def, expression, isNullable } = enumToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: isNullable,
        },
      };
    },
    integer(schema, ctx) {
      const { def, expression } = numberToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: defaultMeta(schema),
      };
    },
    never(schema, ctx) {
      const { def, expression } = neverToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    null(schema, ctx) {
      const { def, expression } = nullToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    number(schema, ctx) {
      const { def, expression } = numberToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: defaultMeta(schema),
      };
    },
    object(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof objectToAst>[0]['applyModifiers'] = (
        result,
        opts,
      ) => this.applyModifiers(result, ctx, opts) as ArktypeFinal;

      const { def, expression, hasLazyExpression } = objectToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        def,
        expression,
        hasLazyExpression,
        meta: inheritMeta(schema, [{ def, expression, meta: defaultMeta(schema) } as ArktypeResult]),
      };
    },
    string(schema, ctx) {
      const { def, expression } = stringToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: defaultMeta(schema),
      };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof tupleToAst>[0]['applyModifiers'] = (
        result,
        opts,
      ) => this.applyModifiers(result, ctx, opts) as ArktypeFinal;

      const { def, expression } = tupleToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        def,
        expression,
        meta: inheritMeta(schema, [{ def, expression, meta: defaultMeta(schema) } as ArktypeResult]),
      };
    },
    undefined(schema, ctx) {
      const { def, expression } = undefinedToAst({
        plugin: ctx.plugin,
        schema,
      });

      return {
        def,
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    unknown(schema, ctx) {
      const { def, expression } = unknownToAst({
        plugin: ctx.plugin,
      });

      return {
        def,
        expression,
        meta: defaultMeta(schema),
      };
    },
    void(schema, ctx) {
      // Arktype doesn't have void, treat as unknown
      const { def, expression } = unknownToAst({
        plugin: ctx.plugin,
      });

      return {
        def,
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
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
    },
    intersection(items, schemas, parentSchema, ctx) {
      const applyModifiers: Parameters<typeof intersectionToAst>[0]['applyModifiers'] = (
        result,
        opts,
      ) => this.applyModifiers(result, ctx, opts) as ArktypeFinal;

      const { def, expression } = intersectionToAst({
        applyModifiers,
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
      });

      return {
        def,
        expression,
        meta: composeMeta(items.map(i => i.meta), { default: parentSchema.default }),
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const applyModifiers: Parameters<typeof unionToAst>[0]['applyModifiers'] = (
        result,
        opts,
      ) => this.applyModifiers(result, ctx, opts) as ArktypeFinal;

      const hasNull = schemas.some(s => s.type === 'null') || items.some(i => i.meta.nullable);

      const { def, expression } = unionToAst({
        applyModifiers,
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
        schemas,
      });

      return {
        def,
        expression,
        meta: composeMeta(items.map(i => i.meta), {
          default: parentSchema.default,
          nullable: hasNull,
        }),
      };
    },
    reference($ref, schema, ctx) {
      const type = ctx.plugin.external('arktype.type');
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
        tool: 'arktype',
      };

      const refSymbol = ctx.plugin.referenceSymbol(query);
      const isRegistered = ctx.plugin.isSymbolRegistered(query);

      if (isRegistered) {
        // Forward reference: direct symbol reference
        return {
          expression: $(refSymbol),
          meta: defaultMeta(schema),
        };
      }

      // Circular or forward reference: we'll handle this in the export phase
      // For now, mark as potentially circular and let the caller handle it
      return {
        expression: $(refSymbol),
        meta: {
          ...defaultMeta(schema),
          hasLazy: true, // Mark as needing special handling
        },
      };
    },
    postProcess(result, schema, ctx) {
      const metadata = ctx.plugin.config.metadata;
      if (!metadata) {
        return result;
      }
      
      // For Arktype, metadata would be added as a description or similar
      // Since Arktype string syntax doesn't easily support metadata attachment,
      // we'll skip it for now or handle it in the object case
      return result;
    },
  };
}