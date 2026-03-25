import type { IR } from '@hey-api/shared';

import { $, type VarType } from '../../../../py-dsl';
import type { IntersectionResolverContext } from '../../resolvers';
import type {
  PydanticField,
  PydanticFinal,
  PydanticResult,
  PydanticType,
} from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

function baseNode(ctx: IntersectionResolverContext): PydanticType {
  const { applyModifiers, childResults, plugin } = ctx;

  if (!childResults.length) {
    return {
      type: plugin.external('typing.Any'),
    };
  }

  if (childResults.length === 1) {
    const finalResult = applyModifiers(childResults[0]!);
    return finalResult;
  }

  const baseClasses: Array<string> = [];
  const mergedFields: Array<PydanticField> = [];
  const seenFieldIds = new Set<number>();

  for (const result of childResults) {
    const finalResult = applyModifiers(result);

    // TODO: replace
    const typeStr = String(finalResult.type);
    const isReference =
      !finalResult.fields &&
      typeStr !== '' &&
      !typeStr.startsWith('dict[') &&
      !typeStr.startsWith('Dict[') &&
      typeStr !== String(plugin.external('typing.Any'));

    if (isReference) {
      const baseName = typeStr.replace(/^'|'$/g, '');
      if (baseName && !baseClasses.includes(baseName)) {
        baseClasses.push(baseName);
      }
    }

    if (finalResult.fields) {
      for (const field of finalResult.fields) {
        if (!seenFieldIds.has(field.name.id)) {
          seenFieldIds.add(field.name.id);
          mergedFields.push(field);
        }
      }
    }
  }

  let type: VarType;

  if (baseClasses.length && !mergedFields.length) {
    type = baseClasses[0]!;
  } else if (mergedFields.length) {
    // TODO: replace
    type = '__INTERSECTION_PLACEHOLDER__';
  } else {
    type = plugin.external('typing.Any');
  }

  return {
    type,
  };
}

function intersectionResolver(ctx: IntersectionResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export interface IntersectionToTypeResult extends PydanticType {
  baseClasses?: Array<string>;
  childResults: Array<PydanticResult>;
  mergedFields?: Array<PydanticField>;
}

export function intersectionToType({
  applyModifiers,
  childResults,
  parentSchema,
  plugin,
}: {
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  childResults: Array<PydanticResult>;
  parentSchema: IR.SchemaObject;
  plugin: PydanticPlugin['Instance'];
}): IntersectionToTypeResult {
  const constraints: FieldConstraints = {};

  if (parentSchema.description !== undefined) {
    constraints.description = parentSchema.description;
  }

  const resolverCtx: IntersectionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    plugin,
    schema: parentSchema,
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const resolved = resolver?.(resolverCtx) ?? intersectionResolver(resolverCtx);

  const baseClasses: Array<string> = [];
  const mergedFields: Array<PydanticField> = [];
  const seenFieldIds = new Set<number>();

  for (const result of childResults) {
    const finalResult = applyModifiers(result);

    // TODO: replace
    const typeStr = String(finalResult.type);
    const isReference =
      !finalResult.fields &&
      typeStr !== '' &&
      !typeStr.startsWith('dict[') &&
      !typeStr.startsWith('Dict[') &&
      typeStr !== String(plugin.external('typing.Any'));

    if (isReference) {
      const baseName = typeStr.replace(/^'|'$/g, '');
      if (baseName && !baseClasses.includes(baseName)) {
        baseClasses.push(baseName);
      }
    }

    if (finalResult.fields) {
      for (const field of finalResult.fields) {
        if (!seenFieldIds.has(field.name.id)) {
          seenFieldIds.add(field.name.id);
          mergedFields.push(field);
        }
      }
    }
  }

  return {
    ...resolved,
    baseClasses: baseClasses.length ? baseClasses : undefined,
    childResults,
    fieldConstraints: Object.keys(constraints).length
      ? { ...constraints, ...resolved.fieldConstraints }
      : resolved.fieldConstraints,
    mergedFields: mergedFields.length ? mergedFields : undefined,
  };
}
