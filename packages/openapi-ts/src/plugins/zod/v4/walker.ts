import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt, shouldCoerceToBigInt } from '../../shared/utils/coerce';
import { identifiers } from '../constants';
import type { ProcessorContext } from '../shared/processor';
import type { Ast, PluginState, ZodAppliedResult, ZodSchemaResult } from '../shared/types';
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
  /** The plugin state references. */
  state: Refs<PluginState>;
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ZodSchemaResult, ZodPlugin['Instance']> {
  const { schemaExtractor, state } = config;
  return {
    applyModifiers(result, ctx, options = {}): ZodAppliedResult {
      const { optional } = options;
      let expression = result.expression.expression;

      if (result.readonly) {
        expression = expression.attr(identifiers.readonly).call();
      }

      const hasDefault = result.default !== undefined;
      const needsNullable = result.nullable;

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
            result.format
              ? maybeBigInt(result.default, result.format)
              : $.fromValue(result.default),
          );
      }

      return { expression };
    },
    array(schema, ctx, walk) {
      const applyModifiers = (result: ZodSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ZodAppliedResult;
      const ast = arrayToAst({
        ...ctx,
        applyModifiers,
        schema,
        state,
        walk,
      });
      return {
        default: schema.default,
        expression: ast,
        hasLazyExpression: state.hasLazyExpression['~ref'],
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    boolean(schema, ctx) {
      const ast = booleanToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    enum(schema, ctx) {
      const ast = enumToAst({ ...ctx, schema, state });
      const hasNull =
        schema.items?.some((item) => item.type === 'null' || item.const === null) ?? false;
      return {
        default: schema.default,
        expression: ast,
        nullable: hasNull,
        readonly: schema.accessScope === 'read',
      };
    },
    integer(schema, ctx) {
      const ast = numberToNode({ ...ctx, schema, state });
      return {
        default: schema.default,
        expression: ast,
        format: schema.format,
        nullable: false,
        readonly: schema.accessScope === 'read',
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
      const z = ctx.plugin.external('zod.z');
      const hasAnyLazy = items.some((item) => item.hasLazyExpression);

      const firstSchema = schemas[0];
      let expression: ZodSchemaResult['expression'];

      // If first item is a union or non-object, use z.intersection()
      // Otherwise use .and() chaining for better type inference
      if (
        firstSchema?.logicalOperator === 'or' ||
        (firstSchema?.type && firstSchema.type !== 'object')
      ) {
        expression = {
          expression: $(z)
            .attr(identifiers.intersection)
            .call(...items.map((item) => item.expression.expression)),
        };
      } else {
        expression = items[0]!.expression;
        items.slice(1).forEach((item) => {
          expression = {
            expression: expression.expression
              .attr(identifiers.and)
              .call(
                item.hasLazyExpression
                  ? $(z)
                      .attr(identifiers.lazy)
                      .call($.func().do(item.expression.expression.return()))
                  : item.expression.expression,
              ),
          };
        });
      }

      return {
        default: parentSchema.default,
        expression,
        hasLazyExpression: hasAnyLazy,
        nullable: items.some((i) => i.nullable),
        readonly: items.some((i) => i.readonly),
      };
    },
    never(schema, ctx) {
      const ast = neverToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: false,
      };
    },
    null(schema, ctx) {
      const ast = nullToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: false,
      };
    },
    number(schema, ctx) {
      const ast = numberToNode({ ...ctx, schema, state });
      return {
        default: schema.default,
        expression: ast,
        format: schema.format,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    object(schema, ctx, walk) {
      const applyModifiers = (result: ZodSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ZodAppliedResult;
      const ast = objectToAst({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        state,
        walk,
        walkerCtx: ctx,
      });
      return {
        default: schema.default,
        expression: ast,
        hasLazyExpression: state.hasLazyExpression['~ref'],
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    postProcess(result, schema, ctx) {
      if (ctx.plugin.config.metadata && schema.description) {
        const z = ctx.plugin.external('zod.z');
        return {
          ...result,
          expression: {
            expression: result.expression.expression
              .attr(identifiers.register)
              .call(
                $(z).attr(identifiers.globalRegistry),
                $.object().pretty().prop('description', $.literal(schema.description)),
              ),
          },
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
          default: schema.default,
          expression: {
            expression: $(refSymbol),
          },
          nullable: false,
          readonly: schema.accessScope === 'read',
        };
      }

      state.hasLazyExpression['~ref'] = true;
      return {
        default: schema.default,
        expression: {
          expression: $(z)
            .attr(identifiers.lazy)
            .call($.func().returns('any').do($(refSymbol).return())),
        },
        hasLazyExpression: true,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    string(schema, ctx) {
      if (shouldCoerceToBigInt(schema.format)) {
        const ast = numberToNode({
          plugin: ctx.plugin,
          schema: { ...schema, type: 'number' },
          state,
        });
        return {
          default: schema.default,
          expression: ast,
          nullable: false,
          readonly: schema.accessScope === 'read',
        };
      }

      const ast = stringToNode({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers = (result: ZodSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ZodAppliedResult;
      const ast = tupleToAst({
        ...ctx,
        applyModifiers,
        schema,
        state,
        walk,
      });
      return {
        default: schema.default,
        expression: ast,
        hasLazyExpression: state.hasLazyExpression['~ref'],
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    undefined(schema, ctx) {
      const ast = undefinedToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: false,
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const z = ctx.plugin.external('zod.z');
      const hasAnyLazy = items.some((item) => item.hasLazyExpression);

      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.nullable);

      const nonNullItems: typeof items = [];

      items.forEach((item, index) => {
        const schema = schemas[index]!;
        if (schema.type !== 'null') {
          nonNullItems.push(item);
        }
      });

      let expression: Ast;
      if (nonNullItems.length === 0) {
        expression = {
          expression: $(z).attr(identifiers.null).call(),
        };
      } else if (nonNullItems.length === 1) {
        expression = nonNullItems[0]!.expression;
      } else {
        expression = {
          expression: $(z)
            .attr(identifiers.union)
            .call(
              $.array()
                .pretty()
                .elements(...nonNullItems.map((item) => item.expression.expression)),
            ),
        };
      }

      return {
        default: parentSchema.default,
        expression,
        hasLazyExpression: hasAnyLazy,
        nullable: hasNull,
        readonly: items.some((i) => i.readonly),
      };
    },
    unknown(schema, ctx) {
      const ast = unknownToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: false,
      };
    },
    void(schema, ctx) {
      const ast = voidToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: ast,
        nullable: false,
        readonly: false,
      };
    },
  };
}
