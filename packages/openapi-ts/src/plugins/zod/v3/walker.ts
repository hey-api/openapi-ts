import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt, shouldCoerceToBigInt } from '../../shared/utils/coerce';
import { identifiers } from '../constants';
import type { Chain } from '../shared/chain';
import { defaultMeta, inheritMeta } from '../shared/meta';
import type { ProcessorContext } from '../shared/processor';
import type { ZodFinal, ZodResult } from '../shared/types';
import type { ZodPlugin } from '../types';
import { arrayToAst } from './toAst/array';
import { booleanToAst } from './toAst/boolean';
import { enumToAst } from './toAst/enum';
import { neverToAst } from './toAst/never';
import { nullToAst } from './toAst/null';
import { numberToNode } from './toAst/number';
import { objectToAst } from './toAst/object';
import { stringToNode } from './toAst/string';
import { tupleToAst } from './toAst/tuple';
import { undefinedToAst } from './toAst/undefined';
import { unknownToAst } from './toAst/unknown';
import { voidToAst } from './toAst/void';

export interface VisitorConfig {
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

export function createVisitor(
  config: VisitorConfig = {},
): SchemaVisitor<ZodResult, ZodPlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result, ctx, options = {}): ZodFinal {
      const { optional } = options;
      let expression = result.expression;

      if (result.meta.readonly) {
        expression = expression.attr(identifiers.readonly).call();
      }

      const hasDefault = result.meta.default !== undefined;
      const needsNullable = result.meta.nullable;

      if (optional && needsNullable) {
        expression = expression.attr(identifiers.nullish).call();
      } else if (optional) {
        expression = expression.attr(identifiers.optional).call();
      } else if (needsNullable) {
        expression = expression.attr(identifiers.nullable).call();
      }

      if (hasDefault) {
        expression = expression
          .attr(identifiers.default)
          .call(
            result.meta.format
              ? maybeBigInt(result.meta.default, result.meta.format)
              : $.fromValue(result.meta.default),
          );
      }

      return {
        expression,
        typeName: result.meta.hasLazy
          ? result.meta.isObject
            ? identifiers.AnyZodObject
            : identifiers.ZodTypeAny
          : undefined,
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
      const z = ctx.plugin.external('zod.z');
      const hasAnyLazy = items.some((item) => item.meta.hasLazy);

      const firstSchema = schemas[0];
      let expression: Chain;

      if (
        firstSchema?.logicalOperator === 'or' ||
        (firstSchema?.type && firstSchema.type !== 'object')
      ) {
        expression = $(z)
          .attr(identifiers.intersection)
          .call(...items.map((item) => item.expression));
      } else {
        expression = items[0]!.expression;
        items.slice(1).forEach((item) => {
          expression = expression
            .attr(identifiers.and)
            .call(
              item.meta.hasLazy && !item.meta.isLazy
                ? $(z).attr(identifiers.lazy).call($.func().do(item.expression.return()))
                : item.expression,
            );
        });
      }

      return {
        expression,
        meta: {
          default: parentSchema.default,
          format: parentSchema.format,
          hasLazy: hasAnyLazy,
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
        meta: {
          ...inheritMeta(schema, childResults),
          isObject: true,
        },
      };
    },
    postProcess(result, schema, ctx) {
      if (ctx.plugin.config.metadata && schema.description) {
        return {
          ...result,
          expression: result.expression
            .attr(identifiers.describe)
            .call($.literal(schema.description)),
        };
      }
      return result;
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
          .call($.func().do($(refSymbol).return())),
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
      const z = ctx.plugin.external('zod.z');
      const hasAnyLazy = items.some((item) => item.meta.hasLazy);

      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.meta.nullable);

      const nonNullItems: typeof items = [];

      items.forEach((item, index) => {
        const schema = schemas[index]!;
        if (schema.type !== 'null' && schema.const !== null) {
          nonNullItems.push(item);
        }
      });

      let expression: Chain;
      if (!nonNullItems.length) {
        expression = $(z).attr(identifiers.null).call();
      } else if (nonNullItems.length === 1) {
        expression = nonNullItems[0]!.expression;
      } else {
        expression = $(z)
          .attr(identifiers.union)
          .call(
            $.array()
              .pretty()
              .elements(...nonNullItems.map((item) => item.expression)),
          );
      }

      return {
        expression,
        meta: {
          default: parentSchema.default,
          format: parentSchema.format,
          hasLazy: hasAnyLazy,
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
