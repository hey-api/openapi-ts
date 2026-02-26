import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $, type MaybePyDsl } from '../../../../py-dsl';
import type { py } from '../../../../ts-python';
import type { PydanticField, PydanticFinal, PydanticResult } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

interface ObjectResolverContext {
  _childResults: Array<PydanticResult>;
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'object'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<PydanticPlugin['Instance']>;
}

export interface ObjectToFieldsResult {
  childResults: Array<PydanticResult>;
  fields?: Array<PydanticField>; // present = emit class
  typeAnnotation?: string | MaybePyDsl<py.Expression>; // present = emit type alias (dict case)
}

function resolveAdditionalProperties(
  ctx: ObjectResolverContext,
): string | MaybePyDsl<py.Expression> | null | undefined {
  const { schema } = ctx;

  if (!schema.additionalProperties || !schema.additionalProperties.type) return undefined;
  if (schema.additionalProperties.type === 'never') return null;

  const result = ctx.walk(
    schema.additionalProperties,
    childContext(ctx.walkerCtx, 'additionalProperties'),
  );
  ctx._childResults.push(result);

  return result.typeAnnotation;
}

function resolveFields(ctx: ObjectResolverContext): Array<PydanticField> {
  const { schema } = ctx;
  const fields: Array<PydanticField> = [];

  for (const name in schema.properties) {
    const property = schema.properties[name]!;
    const isOptional = !schema.required?.includes(name);

    const propertyResult = ctx.walk(property, childContext(ctx.walkerCtx, 'properties', name));
    ctx._childResults.push(propertyResult);

    const final = ctx.applyModifiers(propertyResult, { optional: isOptional });
    fields.push({
      fieldConstraints: final.fieldConstraints,
      isOptional,
      name,
      typeAnnotation: final.typeAnnotation,
    });
  }

  return fields;
}

function objectResolver(ctx: ObjectResolverContext): Omit<ObjectToFieldsResult, 'childResults'> {
  const additional = resolveAdditionalProperties(ctx);

  // additionalProperties: false → strict — still emit a class, just no extra fields
  // additionalProperties: { type: 'never' } → null sentinel → strict class
  if (additional === null) {
    const fields = resolveFields(ctx);
    return { fields };
  }

  if (additional && !ctx.schema.properties) {
    const any = ctx.plugin.external('typing.Any');
    return { typeAnnotation: $('dict').slice('str', any) };
  }

  // additionalProperties with properties → class wins, additional props ignored for now
  // TODO: consider model_config = ConfigDict(extra='allow')
  if (ctx.schema.properties) {
    const fields = resolveFields(ctx);
    return { fields };
  }

  const any = ctx.plugin.external('typing.Any');
  return { typeAnnotation: $('dict').slice('str', any) };
}

export function objectToFields(
  ctx: Pick<ObjectResolverContext, 'applyModifiers' | 'plugin' | 'schema' | 'walk' | 'walkerCtx'>,
): ObjectToFieldsResult {
  const { applyModifiers, plugin, schema, walk, walkerCtx } = ctx;
  const childResults: Array<PydanticResult> = [];

  const extendedCtx: ObjectResolverContext = {
    _childResults: childResults,
    applyModifiers,
    plugin,
    schema,
    walk,
    walkerCtx,
  };

  // const resolver = plugin.config?.['~resolvers']?.object;
  // const resolved = resolver?.(extendedCtx) ?? objectResolver(extendedCtx);
  const resolved = objectResolver(extendedCtx);

  return { childResults, ...resolved };
}
