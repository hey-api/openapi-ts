import type { SymbolMeta } from '@hey-api/codegen-core';
import { fromRef } from '@hey-api/codegen-core';
import type { SchemaExtractor, SchemaVisitor } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import { maybeBigInt } from '../../shared/utils/coerce';
import { composeMeta, defaultMeta, inheritMeta } from '../shared/meta';
import { pipesToNode } from '../shared/pipes';
import type { ProcessorContext } from '../shared/processor';
import type { ValibotFinal, ValibotMeta, ValibotResult } from '../shared/types';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';
import { arrayToPipes } from './toAst/array';
import { booleanToPipes } from './toAst/boolean';
import { enumToPipes } from './toAst/enum';
import { intersectionToPipes } from './toAst/intersection';
import { neverToPipes } from './toAst/never';
import { nullToPipes } from './toAst/null';
import { numberToPipes } from './toAst/number';
import { objectToPipes } from './toAst/object';
import { stringToPipes } from './toAst/string';
import { tupleToPipes } from './toAst/tuple';
import { undefinedToPipes } from './toAst/undefined';
import { unionToPipes } from './toAst/union';
import { unknownToPipes } from './toAst/unknown';
import { voidToPipes } from './toAst/void';

export interface VisitorConfig {
  /** The plugin instance. */
  plugin: ValibotPlugin['Instance'];
  /** Optional schema extractor function. */
  schemaExtractor?: SchemaExtractor<ProcessorContext>;
}

function getDefaultValue(meta: ValibotMeta): ReturnType<typeof $.fromValue> {
  return meta.format ? maybeBigInt(meta.default, meta.format) : $.fromValue(meta.default);
}

export function createVisitor(
  config: VisitorConfig,
): SchemaVisitor<ValibotResult, ValibotPlugin['Instance']> {
  const { plugin, schemaExtractor } = config;

  const v = plugin.imports.v;

  function applyModifiers(
    result: ValibotResult,
    options: { optional?: boolean } = {},
  ): ValibotFinal {
    const pipes: ValibotResult['pipes'] = [...result.pipes];
    if (result.meta.readonly) {
      pipes.push($(v).attr(identifiers.actions.readonly).call());
    }

    const typeName: ValibotFinal['typeName'] = result.meta.hasLazy
      ? identifiers.types.GenericSchema
      : undefined;

    const needsDefault = result.meta.default !== undefined;
    const needsOptional = options.optional || needsDefault;
    const needsNullable = result.meta.nullable;

    if (needsOptional && needsNullable) {
      const innerNode = pipesToNode(pipes, plugin);
      if (needsDefault) {
        return {
          pipes: [
            $(v).attr(identifiers.schemas.nullish).call(innerNode, getDefaultValue(result.meta)),
          ],
          typeName,
        };
      }
      return {
        pipes: [$(v).attr(identifiers.schemas.nullish).call(innerNode)],
        typeName,
      };
    }

    if (needsOptional) {
      const innerNode = pipesToNode(pipes, plugin);
      if (needsDefault) {
        return {
          pipes: [
            $(v).attr(identifiers.schemas.optional).call(innerNode, getDefaultValue(result.meta)),
          ],
          typeName,
        };
      }
      return {
        pipes: [$(v).attr(identifiers.schemas.optional).call(innerNode)],
        typeName,
      };
    }

    if (needsNullable) {
      const innerNode = pipesToNode(pipes, plugin);
      return {
        pipes: [$(v).attr(identifiers.schemas.nullable).call(innerNode)],
        typeName,
      };
    }

    return { pipes, typeName };
  }

  return {
    applyModifiers(result, ctx, opts) {
      return applyModifiers(result, opts);
    },
    array(schema, ctx, walk) {
      const { childResults, pipes } = arrayToPipes({
        applyModifiers,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    boolean(schema, ctx) {
      const pipe = booleanToPipes({ path: ctx.path, plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    enum(schema, ctx) {
      const pipe = enumToPipes({ path: ctx.path, plugin, schema });
      const isNullable =
        schema.items?.some((item) => item.type === 'null' || item.const === null) ?? false;
      return {
        meta: {
          ...defaultMeta(schema),
          nullable: isNullable,
        },
        pipes: [pipe],
      };
    },
    integer(schema, ctx) {
      const pipe = numberToPipes({ path: ctx.path, plugin, schema });
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
          meta: defaultMeta(schema),
          pipes: [$(schema.symbolRef)],
        };
      }
    },
    intersection(items, schemas, parentSchema, ctx) {
      const { pipes } = intersectionToPipes({
        applyModifiers,
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
      });

      return {
        meta: composeMeta(items, { default: parentSchema.default }),
        pipes,
      };
    },
    never(schema, ctx) {
      const pipe = neverToPipes({ path: ctx.path, plugin, schema });
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
      const pipe = nullToPipes({ path: ctx.path, plugin, schema });
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
      const pipe = numberToPipes({ path: ctx.path, plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    object(schema, ctx, walk) {
      const { childResults, pipes } = objectToPipes({
        applyModifiers,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    postProcess(result, schema) {
      const metadata = plugin.config.metadata;
      if (!metadata) {
        return result;
      }
      const node = $.object();
      if (typeof metadata === 'function') {
        metadata({ $, node, schema });
      } else if (schema.description) {
        node.prop('description', $.literal(schema.description));
      }
      if (node.isEmpty) {
        return result;
      }
      const metadataExpr = $(v).attr(identifiers.actions.metadata).call(node);

      return {
        meta: result.meta,
        pipes: [...result.pipes, metadataExpr],
      };
    },
    reference($ref, schema) {
      const query: SymbolMeta = {
        artifact: 'valibot',
        category: 'schema',
        resource: 'definition',
        resourceId: $ref,
      };
      // TODO: contract (self)
      const refSymbol = plugin.referenceSymbol(query);
      // TODO: contract (self)
      const isRegistered = plugin.isSymbolRegistered(query);

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
      const pipe = stringToPipes({ path: ctx.path, plugin, schema });
      return {
        meta: defaultMeta(schema),
        pipes: [pipe],
      };
    },
    tuple(schema, ctx, walk) {
      const { childResults, pipes } = tupleToPipes({
        applyModifiers,
        path: ctx.path,
        plugin,
        schema,
        walk,
      });

      return {
        meta: inheritMeta(schema, childResults),
        pipes,
      };
    },
    undefined(schema, ctx) {
      const pipe = undefinedToPipes({ path: ctx.path, plugin, schema });
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
      const hasNull = schemas.some((s) => s.type === 'null') || items.some((i) => i.meta.nullable);

      const { pipes } = unionToPipes({
        applyModifiers,
        childResults: items,
        parentSchema,
        path: ctx.path,
        plugin,
        schemas,
      });

      return {
        meta: composeMeta(items, {
          default: parentSchema.default,
          nullable: hasNull,
        }),
        pipes,
      };
    },
    unknown(schema, ctx) {
      const pipe = unknownToPipes({ path: ctx.path, plugin });
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
      const pipe = voidToPipes({ path: ctx.path, plugin, schema });
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
