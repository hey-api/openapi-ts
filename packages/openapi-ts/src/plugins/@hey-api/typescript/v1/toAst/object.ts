import { ref } from '@hey-api/codegen-core';
import type { IR, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { createSchemaComment } from '../../../../../plugins/shared/utils/schema';
import { $ } from '../../../../../ts-dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { TypeScriptResult } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function shapeNode(ctx: ObjectResolverContext): ReturnType<typeof $.type.object> {
  const { schema, walk, walkerCtx } = ctx;
  const shape = $.type.object();
  const required = schema.required ?? [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const propertyResult = walk(property, { path: ref([]), plugin: walkerCtx.plugin });
    const isRequired = required.includes(name);
    shape.prop(name, (p) =>
      p
        .$if(walkerCtx.plugin.config.comments && createSchemaComment(property), (p, v) => p.doc(v))
        .readonly(property.accessScope === 'read')
        .required(isRequired)
        .type(propertyResult.type),
    );
  }

  return shape;
}

function baseNode(ctx: ObjectResolverContext): Type {
  const { schema, walk, walkerCtx } = ctx;
  const shape = shapeNode(ctx);
  const required = schema.required ?? [];
  let indexSchemas: Array<IR.SchemaObject> = [];
  let hasOptionalProperties = false;

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = required.includes(name);
    indexSchemas.push(property);

    if (!isRequired) {
      hasOptionalProperties = true;
    }
  }

  if (schema.patternProperties) {
    for (const pattern in schema.patternProperties) {
      const ir = schema.patternProperties[pattern]!;
      indexSchemas.unshift(ir);
    }
  }

  const hasPatterns =
    !!schema.patternProperties && Object.keys(schema.patternProperties).length > 0;

  const addPropsRaw = schema.additionalProperties;
  const addPropsObj =
    addPropsRaw !== false && addPropsRaw ? (addPropsRaw as IR.SchemaObject) : undefined;
  const shouldCreateIndex =
    hasPatterns || (!!addPropsObj && (addPropsObj.type !== 'never' || !indexSchemas.length));

  if (shouldCreateIndex) {
    const addProps = addPropsObj;
    if (addProps && addProps.type !== 'never') {
      if (addProps.type === 'unknown') {
        const patternSchemas: Array<IR.SchemaObject> = schema.patternProperties
          ? Object.values(schema.patternProperties)
          : [];
        indexSchemas = [addProps, ...patternSchemas];
      } else {
        indexSchemas.unshift(addProps);
      }
    } else if (!hasPatterns && !indexSchemas.length && addProps && addProps.type === 'never') {
      indexSchemas = [addProps];
    }

    if (hasOptionalProperties && addProps?.type !== 'unknown') {
      indexSchemas.push({ type: 'undefined' });
    }

    if (indexSchemas.length > 0) {
      const unionSchema: IR.SchemaObject =
        indexSchemas.length === 1
          ? indexSchemas[0]!
          : deduplicateSchema({ schema: { items: indexSchemas, logicalOperator: 'or' } });

      const indexType = walk(unionSchema, { path: ref([]), plugin: walkerCtx.plugin }).type;

      if (schema.propertyNames?.$ref) {
        const propertyNamesResult = walk(
          { $ref: schema.propertyNames.$ref },
          { path: ref([]), plugin: walkerCtx.plugin },
        );
        return $.type.mapped('key').key(propertyNamesResult.type).optional().type(indexType);
      }

      shape.idxSig('key', (i) => i.key('string').type(indexType));
    }
  }

  return shape;
}

function objectResolver(ctx: ObjectResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function objectToAst({
  plugin,
  schema,
  walk,
  walkerCtx,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']>;
}): Type {
  const ctx: ObjectResolverContext = {
    $,
    nodes: {
      base: baseNode,
      shape: shapeNode,
    },
    plugin,
    schema,
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.object;
  const result = resolver?.(ctx);
  return result ?? objectResolver(ctx);
}
