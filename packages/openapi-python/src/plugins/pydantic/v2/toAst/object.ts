import { childContext } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { ObjectResolverContext } from '../../resolvers';
import type { PydanticResult, PydanticType } from '../../shared/types';

export interface ObjectToFieldsResult extends PydanticType {
  childResults: Array<PydanticResult>;
}

function additionalPropertiesNode(ctx: ObjectResolverContext): PydanticType | null | undefined {
  const { path, plugin, schema } = ctx;

  if (!schema.additionalProperties) return;
  if (schema.additionalProperties.type === 'never') return null;
  if (schema.additionalProperties.type === 'unknown') {
    if (ctx.schema.properties) {
      return {
        node: {
          config: { extra: 'allow' },
          fields: fieldsNode(ctx),
          kind: 'model',
        },
      };
    }
    return;
  }

  const result = ctx.walk(
    schema.additionalProperties,
    childContext({ path, plugin }, 'additionalProperties'),
  );
  ctx._childResults.push(result);

  return { type: result.type };
}

function fieldsNode(ctx: ObjectResolverContext): Array<ReturnType<typeof $$.field>> {
  const { path, plugin, schema } = ctx;
  const fields: Array<ReturnType<typeof $$.field>> = [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isRequired = schema.required?.includes(name) ?? false;

    const result = ctx.walk(property, childContext({ path, plugin }, 'properties', name));
    ctx._childResults.push(result);

    if (property.description !== undefined && result.type) {
      result.type.mergeConstraints($$.constraints().description(property.description));
    }
    if (property.title !== undefined && result.type) {
      result.type.mergeConstraints($$.constraints().title(property.title));
    }

    const isOptional = !isRequired;
    const nullable = result.meta.nullable || isOptional;

    const hasSchemaDefault = result.meta.default !== undefined;
    const defaultValue = hasSchemaDefault ? result.meta.default : isOptional ? null : undefined;

    const field = $$.field(plugin, name)
      .$if(result.unionMembers, (f, t) => f.type(t))
      .$if(!result.unionMembers && result.type, (f, t) => f.type(t))
      .$if(result.unionMembers && result.type, (f, t) => f.metadata(t))
      .nullable(nullable)
      .$if(defaultValue !== undefined, (f) => f.default(defaultValue))
      .$if(property.deprecated, (f) => f.deprecated(true))
      .$if(result.discriminator, (f, d) => f.discriminator(d));

    fields.push(field);
  }

  return fields;
}

function baseNode(ctx: ObjectResolverContext): PydanticType {
  const additional = additionalPropertiesNode(ctx);

  if (additional === null) {
    return {
      node: {
        config: { extra: 'forbid' },
        fields: fieldsNode(ctx),
        kind: 'model',
      },
    };
  }

  if (additional) {
    if (!ctx.schema.properties) {
      const type = $$.constrainedType($('dict').slice('str', additional.type!.type));
      return {
        node: { kind: 'rootModel', type },
        type,
      };
    }
    return {
      node: {
        config: { extra: 'allow' },
        fields: fieldsNode(ctx),
        kind: 'model',
      },
    };
  }

  if (ctx.schema.properties) {
    return { node: { fields: fieldsNode(ctx), kind: 'model' } };
  }

  return {
    node: { fields: [], kind: 'model' },
    type: $$.constrainedType($('dict').slice('str', ctx.plugin.imports.typing.Any)),
  };
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

  return { childResults, ...resolved };
}
