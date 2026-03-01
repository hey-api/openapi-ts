import type { IR } from '@hey-api/shared';

import type { AnnotationExpr } from '../../../../py-dsl';
import type {
  PydanticField,
  PydanticFinal,
  PydanticResult,
  PydanticType,
} from '../../shared/types';
import type { PydanticPlugin } from '../../types';

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
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};

  if (parentSchema.description !== undefined) {
    constraints.description = parentSchema.description;
  }

  if (childResults.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      typeAnnotation: plugin.external('typing.Any'),
    };
  }

  if (childResults.length === 1) {
    const finalResult = applyModifiers(childResults[0]!);
    return {
      childResults,
      fieldConstraints: { ...constraints, ...finalResult.fieldConstraints },
      mergedFields: finalResult.fields,
      typeAnnotation: finalResult.typeAnnotation,
    };
  }

  const baseClasses: Array<string> = [];
  const mergedFields: Array<PydanticField> = [];
  const seenFieldIds = new Set<number>();

  for (const result of childResults) {
    const finalResult = applyModifiers(result);

    // TODO: replace
    const typeStr = String(finalResult.typeAnnotation);
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

  let typeAnnotation: AnnotationExpr;

  if (baseClasses.length > 0 && mergedFields.length === 0) {
    typeAnnotation = baseClasses[0]!;
  } else if (mergedFields.length > 0) {
    // TODO: replace
    typeAnnotation = '__INTERSECTION_PLACEHOLDER__';
  } else {
    typeAnnotation = plugin.external('typing.Any');
  }

  return {
    baseClasses: baseClasses.length > 0 ? baseClasses : undefined,
    childResults,
    fieldConstraints: constraints,
    mergedFields: mergedFields.length > 0 ? mergedFields : undefined,
    typeAnnotation,
  };
}
