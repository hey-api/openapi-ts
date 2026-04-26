import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt, shouldCoerceToBigInt } from '../../shared/utils/coerce';
import { identifiers } from '../constants';
import { defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { ZodFinal, ZodMeta, ZodResult } from '../shared/types';
import type { ZodPlugin } from '../types';
import { arrayToAst } from './toAst/array';
import { booleanToAst } from './toAst/boolean';
import { enumToAst } from './toAst/enum';
import { intersectionToAst } from './toAst/intersection';
import { neverToAst } from './toAst/never';
import { nullToAst } from './toAst/null';
import { numberToNode } from './toAst/number';
import { objectToAst } from './toAst/object';
import { stringToNode } from './toAst/string';
import { tupleToAst } from './toAst/tuple';
import { undefinedToAst } from './toAst/undefined';
import { unionToAst } from './toAst/union';
import { unknownToAst } from './toAst/unknown';
import { voidToAst } from './toAst/void';

export interface VisitorConfig {
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

function getDefaultValue(meta: ZodMeta): ReturnType<typeof $.fromValue> {
  return meta.format ? maybeBigInt(meta.default, meta.format) : $.fromValue(meta.default);
}

export function createVisitor(
  config: VisitorConfig = {},
): SchemaVisitor<ZodResult, ZodPlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result, ctx, options = {}): ZodFinal {
      const { optional } = options;
      const z = ctx.plugin.external('zod.z');
      let expression = result.expression;

      if (result.meta.readonly) {
        expression = $(z).attr(identifiers.readonly).call(expression);
      }

      const needsDefault = result.meta.default !== undefined;
      const needsNullable = result.meta.nullable;

      if (optional && needsNullable) {
        expression = $(z).attr(identifiers.nullish).call(expression);
      } else if (optional) {
        expression = $(z).attr(identifiers.optional).call(expression);
      } else if (needsNullable) {
        expression = $(z).attr(identifiers.nullable).call(expression);
      }

      if (needsDefault) {
        expression = $(z).attr(identifiers._default).call(expression, getDefaultValue(result.meta));
      }

      return {
        expression,
      };
    },
    array(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof arrayToAst>[0]['applyModifiers'] = (result, opts) =>
        this.applyModifiers(result, ctx, opts) as ZodFinal;
      const { childResults, expression } = arrayToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        expression,
        meta: inheritMeta(schema, childResults),
      };
    },
    boolean(schema, ctx) {
      const expression = booleanToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: defaultMeta(schema),
      };
    },
    enum(schema, ctx) {
      const expression = enumToAst({ plugin: ctx.plugin, schema });
      const hasNull =
        schema.items?.some((item) => item.type === 'null' || item.const === null) ?? false;
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: hasNull,
        },
      };
    },
    integer(schema, ctx) {
      const expression = numberToNode({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          format: schema.format,
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
      if (schema.symbolRef) {
        return {
          expression: $(schema.symbolRef),
          meta: defaultMeta(schema),
        };
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const hasAnyLazy = items.some((item) => item.meta.hasLazy);

      const { expression } = intersectionToAst({
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
        schemas,
      });

      return {
        expression,
        meta: {
          default: parentSchema.default,
          format: parentSchema.format,
          hasLazy: hasAnyLazy,
          isIntersection: true,
          isLazy: false,
          nullable: items.some((i) => i.meta.nullable),
          readonly: items.some((i) => i.meta.readonly),
        },
      };
    },
    never(schema, ctx) {
      const expression = neverToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    null(schema, ctx) {
      const expression = nullToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    number(schema, ctx) {
      const expression = numberToNode({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          format: schema.format,
        },
      };
    },
    object(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof objectToAst>[0]['applyModifiers'] = (result, opts) =>
        this.applyModifiers(result, ctx, opts) as ZodFinal;
      const { childResults, expression } = objectToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        expression,
        meta: inheritMeta(schema, childResults),
      };
    },
    postProcess(result, schema, ctx) {
      const { metadata } = ctx.plugin.config;

      if (!metadata) {
        return result;
      }

      const node = $.object();

      if (metadata === true) {
        if (!schema.description) {
          return result;
        }
        node.pretty().prop('description', $.literal(schema.description));
      } else {
        metadata({ $, node, schema });
      }

      if (node.isEmpty) {
        return result;
      }

      const z = ctx.plugin.external('zod.z');

      return {
        ...result,
        expression: result.expression
          .attr(identifiers.register)
          .call($(z).attr(identifiers.globalRegistry), node),
      };
    },
    reference($ref, schema, ctx) {
      const z = ctx.plugin.external('zod.z');
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
        tool: 'zod',
      };

      const refSymbol = ctx.plugin.referenceSymbol(query);

      if (ctx.plugin.isSymbolRegistered(query)) {
        return {
          expression: $(refSymbol),
          meta: defaultMeta(schema),
        };
      }

      return {
        expression: $(z)
          .attr(identifiers.lazy)
          .call($.func().returns('any').do($(refSymbol).return())),
        meta: {
          ...defaultMeta(schema),
          hasLazy: true,
          isLazy: true,
        },
      };
    },
    string(schema, ctx) {
      if (shouldCoerceToBigInt(schema.format)) {
        const expression = numberToNode({
          plugin: ctx.plugin,
          schema: { ...schema, type: 'number' },
        });
        return {
          expression,
          meta: defaultMeta(schema),
        };
      }

      const expression = stringToNode({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: defaultMeta(schema),
      };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers: Parameters<typeof tupleToAst>[0]['applyModifiers'] = (result, opts) =>
        this.applyModifiers(result, ctx, opts) as ZodFinal;
      const { childResults, expression } = tupleToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        expression,
        meta: inheritMeta(schema, childResults),
      };
    },
    undefined(schema, ctx) {
      const expression = undefinedToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const hasAnyLazy = items.some((item) => item.meta.hasLazy);
      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.meta.nullable);

      const { expression } = unionToAst({
        childResults: items,
        parentSchema,
        plugin: ctx.plugin,
        schemas,
      });

      return {
        expression,
        meta: {
          default: parentSchema.default,
          format: parentSchema.format,
          hasLazy: hasAnyLazy,
          isIntersection: false,
          isLazy: false,
          nullable: hasNull,
          readonly: items.some((i) => i.meta.readonly),
        },
      };
    },
    unknown(schema, ctx) {
      const expression = unknownToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    void(schema, ctx) {
      const expression = voidToAst({ plugin: ctx.plugin, schema });
      return {
        expression,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
  };
}
