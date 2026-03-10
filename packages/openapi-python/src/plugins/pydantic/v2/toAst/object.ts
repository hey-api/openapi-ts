import { childContext, toCase } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { safeRuntimeName } from '../../../../py-dsl/utils/name';
import type { ObjectResolverContext } from '../../resolvers';
import type { PydanticField, PydanticResult, PydanticType } from '../../shared/types';

export interface ObjectToFieldsResult extends Pick<PydanticResult, 'fields' | 'type'> {
  childResults: Array<PydanticResult>;
}

function additionalPropertiesNode(ctx: ObjectResolverContext): PydanticType | null | undefined {
  const { schema } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return undefined;
  if (schema.additionalProperties.type === 'never') return null;

  const result = ctx.walk(
    schema.additionalProperties,
    childContext(ctx.walkerCtx, 'additionalProperties'),
  );
  ctx._childResults.push(result);

  return {
    type: result.type,
  };
}

function fieldsNode(ctx: ObjectResolverContext): Array<PydanticField> {
  const { schema } = ctx;
  const fields: Array<PydanticField> = [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = ctx.walk(property, childContext(ctx.walkerCtx, 'properties', name));
    ctx._childResults.push(propertyResult);

    const final = ctx.applyModifiers(propertyResult, { optional: isOptional });
    const snakeCaseName = safeRuntimeName(toCase(name, 'snake_case'));
    fields.push({
      fieldConstraints: final.fieldConstraints,
      isOptional,
      name: ctx.plugin.symbol(snakeCaseName),
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
    const any = ctx.plugin.external('typing.Any');
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

  const any = ctx.plugin.external('typing.Any');
  return { type: $('dict').slice('str', any) };
}

function objectResolver(ctx: ObjectResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function objectToFields(
  ctx: Pick<ObjectResolverContext, 'applyModifiers' | 'plugin' | 'schema' | 'walk' | 'walkerCtx'>,
): ObjectToFieldsResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;
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
    plugin,
    schema,
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.object;
  const resolved = resolver?.(extendedCtx) ?? objectResolver(extendedCtx);

  const childResultsFinal = extendedCtx._childResults;

  return { childResults: childResultsFinal, ...resolved };
}
