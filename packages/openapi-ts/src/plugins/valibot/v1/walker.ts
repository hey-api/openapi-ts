import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt } from '../../shared/utils/coerce';
import { composeMeta, defaultMeta, inheritMeta } from '../shared/meta';
import type { Pipes } from '../shared/pipes';
import { pipesToNode } from '../shared/pipes';
import type { ProcessorContext } from '../shared/processor';
import type { ValibotFinal, ValibotMeta, ValibotResult } from '../shared/types';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
import { arrayToPipes } from './toAst/array';
import { booleanToPipes } from './toAst/boolean';
import { enumToPipes } from './toAst/enum';
import { neverToPipes } from './toAst/never';
import { nullToPipes } from './toAst/null';
import { numberToPipes } from './toAst/number';
import { objectToPipes } from './toAst/object';
import { stringToPipes } from './toAst/string';
import { tupleToPipes } from './toAst/tuple';
import { undefinedToPipes } from './toAst/undefined';
import { unknownToPipes } from './toAst/unknown';
import { voidToPipes } from './toAst/void';

export interface VisitorConfig {
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

function getDefaultValue(meta: ValibotMeta): ReturnType<typeof $.fromValue> {
  return meta.format ? maybeBigInt(meta.default, meta.format) : $.fromValue(meta.default);
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ValibotResult, ValibotPlugin['Instance']> {
  const { schemaExtractor } = config;

  return {
    applyModifiers(result, ctx, options = {}): ValibotFinal {
      const { optional } = options;
      const v = ctx.plugin.external('valibot.v');
      const pipes: Pipes = [...result.pipes];

      if (result.meta.readonly) {
        pipes.push($(v).attr(identifiers.actions.readonly).call());
      }

      const hasDefault = result.meta.default !== undefined;
      const needsOptional = optional || hasDefault;
      const needsNullable = result.meta.nullable;
      const innerNode = pipesToNode(pipes, ctx.plugin);

      let finalPipes: Pipes;

      if (needsOptional && needsNullable) {
        if (hasDefault) {
          finalPipes = [
            $(v).attr(identifiers.schemas.nullish).call(innerNode, getDefaultValue(result.meta)),
          ];
        } else {
          finalPipes = [$(v).attr(identifiers.schemas.nullish).call(innerNode)];
        }
      } else if (needsOptional) {
        if (hasDefault) {
          finalPipes = [
            $(v).attr(identifiers.schemas.optional).call(innerNode, getDefaultValue(result.meta)),
          ];
        } else {
          finalPipes = [$(v).attr(identifiers.schemas.optional).call(innerNode)];
        }
      } else if (needsNullable) {
        finalPipes = [$(v).attr(identifiers.schemas.nullable).call(innerNode)];
      } else {
        finalPipes = pipes;
      }

      return {
        pipes: finalPipes,
        typeName: result.meta.hasLazy ? identifiers.types.GenericSchema : undefined,
      };
    },
    array(schema, ctx, walk) {
      const applyModifiers = (result: ValibotResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotFinal;

      const { childResults, pipes } = arrayToPipes({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    boolean(schema, ctx) {
      const pipe = booleanToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    enum(schema, ctx) {
      const { isNullable, pipe } = enumToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: isNullable,
        },
        pipes: [pipe],
      };
    },
    integer(schema, ctx) {
      const pipe = numberToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
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
      const itemNodes = items.map((item) => pipesToNode(item.pipes, ctx.plugin));

      return {
        meta: composeMeta(items, { default: parentSchema.default }),
        pipes: [
          $(v)
            .attr(identifiers.schemas.intersect)
            .call($.array(...itemNodes)),
        ],
      };
    },
    never(schema, ctx) {
      const pipe = neverToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
        pipes: [pipe],
      };
    },
    null(schema, ctx) {
      const pipe = nullToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
        pipes: [pipe],
      };
    },
    number(schema, ctx) {
      const pipe = numberToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    object(schema, ctx, walk) {
      const applyModifiers = (result: ValibotResult, opts: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotFinal;

      const { childResults, pipes } = objectToPipes({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    postProcess(result, schema, ctx) {
      if (ctx.plugin.config.metadata && schema.description) {
        const v = ctx.plugin.external('valibot.v');
        const metadataExpr = $(v)
          .attr(identifiers.actions.metadata)
          .call($.object().prop('description', $.literal(schema.description)));

        return {
          meta: result.meta,
          pipes: [...result.pipes, metadataExpr],
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
      const isRegistered = ctx.plugin.isSymbolRegistered(query);

      if (isRegistered) {
        return {
          meta: defaultMeta(schema),
          pipes: [$(refSymbol)],
        };
      }

      return {
        meta: {
          ...defaultMeta(schema),
          hasLazy: true,
        },
        pipes: [
          $(v)
            .attr(identifiers.schemas.lazy)
            .call($.func().do($(refSymbol).return())),
        ],
      };
    },
    string(schema, ctx) {
      const pipe = stringToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    tuple(schema, ctx, walk) {
      const applyModifiers = (result: ValibotResult, opts?: { optional?: boolean }) =>
        this.applyModifiers(result, ctx, opts) as ValibotFinal;

      const { childResults, pipes } = tupleToPipes({
        applyModifiers,
        plugin: ctx.plugin,
        schema,
        walk,
        walkerCtx: ctx,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    undefined(schema, ctx) {
      const pipe = undefinedToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
        pipes: [pipe],
      };
    },
    union(items, schemas, parentSchema, ctx) {
      const v = ctx.plugin.external('valibot.v');

      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.meta.nullable);

      const nonNullItems: Array<ValibotResult> = [];
      items.forEach((item, index) => {
        const schema = schemas[index]!;
        if (schema.type !== 'null') {
          nonNullItems.push(item);
        }
      });

      let pipes: Pipes;

      if (nonNullItems.length === 0) {
        pipes = [$(v).attr(identifiers.schemas.null).call()];
      } else if (nonNullItems.length === 1) {
        pipes = nonNullItems[0]!.pipes;
      } else {
        const itemNodes = nonNullItems.map((i) => pipesToNode(i.pipes, ctx.plugin));
        pipes = [
          $(v)
            .attr(identifiers.schemas.union)
            .call($.array(...itemNodes)),
        ];
      }

      return {
        meta: composeMeta(items, {
          default: parentSchema.default,
          nullable: hasNull,
        }),
        pipes,
      };
    },
    unknown(schema, ctx) {
      const pipe = unknownToPipes({ plugin: ctx.plugin });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
        pipes: [pipe],
      };
    },
    void(schema, ctx) {
      const pipe = voidToPipes({ plugin: ctx.plugin, schema });
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: false,
          readonly: false,
        },
        pipes: [pipe],
      };
    },
  };
}
