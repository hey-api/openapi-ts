import type { Refs, SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt, shouldCoerceToBigInt } from '../../shared/utils/coerce';
import { pipesToNode } from '../shared/pipes';
import type { ProcessorContext } from '../shared/processor';
import type { PluginState, ValibotAppliedResult, ValibotSchemaResult } from '../shared/types';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
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

function getDefaultValue(result: ValibotSchemaResult) {
  return result.format ? maybeBigInt(result.default, result.format) : $.fromValue(result.default);
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ValibotSchemaResult, ValibotPlugin['Instance']> {
  const { schemaExtractor, state } = config;
  return {
    applyModifiers(result, ctx, options = {}): ValibotAppliedResult {
      const { optional } = options;
      const v = ctx.plugin.external('valibot.v');
      const pipes = [...result.expression.pipes];

      if (result.readonly) {
        pipes.push($(v).attr(identifiers.actions.readonly).call());
      }

      const hasDefault = result.default !== undefined;
      const needsOptional = optional || hasDefault;
      const needsNullable = result.nullable;
      const innerNode = pipesToNode(pipes, ctx.plugin);

      if (needsOptional && needsNullable) {
        if (hasDefault) {
          return {
            pipes: [
              $(v).attr(identifiers.schemas.nullish).call(innerNode, getDefaultValue(result)),
            ],
          };
        }
        return { pipes: [$(v).attr(identifiers.schemas.nullish).call(innerNode)] };
      }

      if (needsOptional) {
        if (hasDefault) {
          return {
            pipes: [
              $(v).attr(identifiers.schemas.optional).call(innerNode, getDefaultValue(result)),
            ],
          };
        }
        return { pipes: [$(v).attr(identifiers.schemas.optional).call(innerNode)] };
      }

      if (needsNullable) {
        return { pipes: [$(v).attr(identifiers.schemas.nullable).call(innerNode)] };
      }

      return { pipes };
    },
    array(schema, ctx, walk) {
      const applyModifiers = (result: ValibotSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotAppliedResult;
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
      const pipe = booleanToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    enum(schema, ctx) {
      const pipe = enumToAst({ ...ctx, schema, state });
      const hasNull =
        schema.items?.some((item) => item.type === 'null' || item.const === null) ?? false;
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: hasNull,
        readonly: schema.accessScope === 'read',
      };
    },
    integer(schema, ctx) {
      const pipe = numberToNode({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
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
      const v = ctx.plugin.external('valibot.v');
      const hasAnyLazy = items.some((item) => item.hasLazyExpression);
      const itemNodes = items.map((item) => pipesToNode(item.expression.pipes, ctx.plugin));

      return {
        default: parentSchema.default,
        expression: {
          pipes: [
            $(v)
              .attr(identifiers.schemas.intersect)
              .call($.array(...itemNodes)),
          ],
        },
        hasLazyExpression: hasAnyLazy,
        nullable: items.some((i) => i.nullable),
        readonly: items.some((i) => i.readonly),
      };
    },
    never(schema, ctx) {
      const pipe = neverToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: false,
      };
    },
    null(schema, ctx) {
      const pipe = nullToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: false,
      };
    },
    number(schema, ctx) {
      const pipe = numberToNode({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        format: schema.format,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    object(schema, ctx, walk) {
      const applyModifiers = (result: ValibotSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotAppliedResult;
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
        const v = ctx.plugin.external('valibot.v');
        const metadataExpr = $(v)
          .attr(identifiers.actions.metadata)
          .call($.object().prop('description', $.literal(schema.description)));
        return {
          ...result,
          expression: { pipes: [...result.expression.pipes, metadataExpr] },
        };
      }
      return result;
    },
    reference($ref, schema, ctx) {
      const v = ctx.plugin.external('valibot.v');
      const query: SymbolMeta = {
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
        tool: 'valibot',
      };

      const refSymbol = ctx.plugin.referenceSymbol(query);

      if (ctx.plugin.isSymbolRegistered(query)) {
        return {
          default: schema.default,
          expression: { pipes: [$(refSymbol)] },
          nullable: false,
          readonly: schema.accessScope === 'read',
        };
      }

      state.hasLazyExpression['~ref'] = true;
      return {
        default: schema.default,
        expression: {
          pipes: [
            $(v)
              .attr(identifiers.schemas.lazy)
              .call($.func().do($(refSymbol).return())),
          ],
        },
        hasLazyExpression: true,
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    string(schema, ctx) {
      if (shouldCoerceToBigInt(schema.format)) {
        const pipe = numberToNode({
          plugin: ctx.plugin,
          schema: { ...schema, type: 'number' },
        });
        return {
          default: schema.default,
          expression: { pipes: [pipe] },
          nullable: false,
          readonly: schema.accessScope === 'read',
        };
      }

      const pipe = stringToNode({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: schema.accessScope === 'read',
      };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers = (result: ValibotSchemaResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotAppliedResult;
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
      const pipe = undefinedToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: false,
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const v = ctx.plugin.external('valibot.v');
      const hasAnyLazy = items.some((item) => item.hasLazyExpression);

      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.nullable);

      const nonNullItems: typeof items = [];

      items.forEach((item, index) => {
        const schema = schemas[index]!;
        if (schema.type !== 'null') {
          nonNullItems.push(item);
        }
      });

      let expression: ValibotSchemaResult['expression'];
      if (nonNullItems.length === 0) {
        expression = { pipes: [$(v).attr(identifiers.schemas.null).call()] };
      } else if (nonNullItems.length === 1) {
        expression = nonNullItems[0]!.expression;
      } else {
        const itemNodes = nonNullItems.map((i) => pipesToNode(i.expression.pipes, ctx.plugin));
        expression = {
          pipes: [
            $(v)
              .attr(identifiers.schemas.union)
              .call($.array(...itemNodes)),
          ],
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
      const pipe = unknownToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: false,
      };
    },
    void(schema, ctx) {
      const pipe = voidToAst({ ...ctx, schema });
      return {
        default: schema.default,
        expression: { pipes: [pipe] },
        nullable: false,
        readonly: false,
      };
    },
  };
}
