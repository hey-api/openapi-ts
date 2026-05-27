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
  /** The plugin instance. */
  plugin: ZodPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

function getDefaultValue(meta: ZodMeta): ReturnType<typeof $.fromValue> {
  return meta.format ? maybeBigInt(meta.default, meta.format) : $.fromValue(meta.default);
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ZodResult, ZodPlugin['Instance']> {
  const { plugin, schemaExtractor } = config;

  const z = plugin.symbols.z;

  return {
    applyModifiers(result, ctx, options = {}): ZodFinal {
      const { optional } = options;
      let chain = result.chain;

      if (result.meta.readonly) {
        chain = $(z).attr(identifiers.readonly).call(chain);
      }

      const needsDefault = result.meta.default !== undefined;
      const needsNullable = result.meta.nullable;

      if (optional && needsNullable) {
        chain = $(z).attr(identifiers.nullish).call(chain);
      } else if (optional) {
        chain = $(z).attr(identifiers.optional).call(chain);
      } else if (needsNullable) {
        chain = $(z).attr(identifiers.nullable).call(chain);
      }

      if (needsDefault) {
        chain = $(z).attr(identifiers._default).call(chain, getDefaultValue(result.meta));
      }

      return {
        chain,
      };
    },
    array(schema, ctx, walk) {
      const { chain, childResults } = arrayToAst({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as ZodFinal,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        chain,
        meta: inheritMeta(schema, childResults),
      };
    },
    boolean(schema, ctx) {
      const chain = booleanToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: defaultMeta(schema),
      };
    },
    enum(schema, ctx) {
      const chain = enumToAst({ path: ctx.path, plugin, schema });
      const hasNull =
        schema.items?.some((item) => item.type === 'null' || item.const === null) ?? false;
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          nullable: hasNull,
        },
      };
    },
    integer(schema, ctx) {
      const chain = numberToNode({ path: ctx.path, plugin, schema });
      return {
        chain,
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
          naming: plugin.config.definitions,
          path: fromRef(ctx.path),
          plugin,
          schema,
        });
        if (extracted !== schema) {
          return walk(extracted, ctx);
        }
      }
      if (schema.symbolRef) {
        return {
          chain: $(schema.symbolRef),
          meta: defaultMeta(schema),
        };
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const hasAnyLazy = items.some((item) => item.meta.hasLazy);

      const { chain } = intersectionToAst({
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
        schemas,
      });

      return {
        chain,
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
      const chain = neverToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    null(schema, ctx) {
      const chain = nullToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    number(schema, ctx) {
      const chain = numberToNode({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          format: schema.format,
        },
      };
    },
    object(schema, ctx, walk) {
      const { chain, childResults } = objectToAst({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as ZodFinal,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        chain,
        meta: inheritMeta(schema, childResults),
      };
    },
    postProcess(result, schema) {
      const { metadata } = plugin.config;

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

      return {
        ...result,
        chain: result.chain
          .attr(identifiers.register)
          .call($(z).attr(identifiers.globalRegistry), node),
      };
    },
    reference($ref, schema) {
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
        tool: 'zod',
      };

      const refSymbol = plugin.referenceSymbol(query);

      if (plugin.isSymbolRegistered(query)) {
        return {
          chain: $(refSymbol),
          meta: defaultMeta(schema),
        };
      }

      return {
        chain: $(z)
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
        const chain = numberToNode({
          path: ctx.path,
          plugin,
          schema: { ...schema, type: 'number' },
        });
        return {
          chain,
          meta: defaultMeta(schema),
        };
      }

      const chain = stringToNode({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: defaultMeta(schema),
      };
    },
    tuple(schema, ctx, walk) {
      const { chain, childResults } = tupleToAst({
        applyModifiers: (result, opts) => this.applyModifiers(result, ctx, opts) as ZodFinal,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        chain,
        meta: inheritMeta(schema, childResults),
      };
    },
    undefined(schema, ctx) {
      const chain = undefinedToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
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

      const { chain } = unionToAst({
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
        schemas,
      });

      return {
        chain,
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
      const chain = unknownToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
    void(schema, ctx) {
      const chain = voidToAst({ path: ctx.path, plugin, schema });
      return {
        chain,
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
      };
    },
  };
}
