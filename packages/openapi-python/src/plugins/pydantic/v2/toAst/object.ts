import { childContext } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { PydanticField, PydanticResult, PydanticType } from '../../shared/types';

export interface ObjectToFieldsResult extends Pick<PydanticResult, 'fields' | 'type'> {
  childResults: Array<PydanticResult>;
}

function additionalPropertiesNode(ctx: ObjectResolverContext): PydanticType | null | undefined {
  const { path, plugin, schema } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return;
  if (schema.additionalProperties.type === 'never') return null;

  const result = ctx.walk(
    schema.additionalProperties,
    childContext({ path, plugin }, 'additionalProperties'),
  );
  ctx._childResults.push(result);

  return {
    type: result.type,
  };
}

function fieldsNode(ctx: ObjectResolverContext): Array<PydanticField> {
  const { path, plugin, schema } = ctx;
  const fields: Array<PydanticField> = [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = ctx.walk(property, childContext({ path, plugin }, 'properties', name));
    ctx._childResults.push(propertyResult);

    const final = ctx.applyModifiers(propertyResult, { optional: isOptional });
    fields.push({
      fieldConstraints: final.fieldConstraints,
      isOptional,
      name: plugin.symbol(name),
      originalName: name,
      type: final.type,
    });
  }

  return fields;
}

function baseNode(ctx: ObjectResolverContext): PydanticType & { fields?: Array<PydanticField> } {
  const additional = additionalPropertiesNode(ctx);

  if (additional === null) {
    const fields = fieldsNode(ctx);
    return { fields };
  }

  if (additional) {
    const any = ctx.plugin.symbols.typing.Any;
    if (!ctx.schema.properties) {
      return { type: $('dict').slice('str', any) };
    }
    return { type: $('dict').slice('str', any) };
  }

  // TODO: consider model_config = ConfigDict(extra='allow')
  if (ctx.schema.properties) {
    const fields = fieldsNode(ctx);
    return { fields };
  }

  const any = ctx.plugin.symbols.typing.Any;
  return { type: $('dict').slice('str', any) };
}

function objectResolver(ctx: ObjectResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function objectToFields(
  ctx: Pick<ObjectResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): ObjectToFieldsResult {
  const { applyModifiers, path, plugin, schema, walk } = ctx;
  const childResults: Array<PydanticResult> = [];

  const extendedCtx: ObjectResolverContext = {
    $,
    _childResults: childResults,
    applyModifiers,
    nodes: {
      additionalProperties: additionalPropertiesNode,
      base: baseNode,
      fields: fieldsNode,
    },
    path,
    plugin,
    schema,
    walk,
  };

  const resolver = plugin.config['~resolvers']?.object;
  const resolved = resolver?.(extendedCtx) ?? objectResolver(extendedCtx);

  const childResultsFinal = extendedCtx._childResults;

  return { childResults: childResultsFinal, ...resolved };
}
