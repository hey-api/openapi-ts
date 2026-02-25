import type { IR } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export interface UnionToTypeResult extends PydanticType {
  childResults: Array<PydanticResult>;
  isNullable: boolean;
}

export function unionToType({
  applyModifiers,
  childResults,
  parentSchema,
  plugin,
}: {
  applyModifiers: (result: PydanticResult, options?: { optional?: boolean }) => PydanticFinal;
  childResults: Array<PydanticResult>;
  parentSchema: IR.SchemaObject;
  plugin: PydanticPlugin['Instance'];
}): UnionToTypeResult {
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};

  if (parentSchema.description !== undefined) {
    constraints.description = parentSchema.description;
  }

  const nonNullResults: Array<PydanticResult> = [];
  let isNullable = false;

  for (const result of childResults) {
    if (result.typeAnnotation === 'None') {
      isNullable = true;
    } else {
      nonNullResults.push(result);
    }
  }

  isNullable = isNullable || childResults.some((r) => r.meta.nullable);

  if (nonNullResults.length === 0) {
    return {
      childResults,
      fieldConstraints: constraints,
      isNullable: true,
      typeAnnotation: 'None',
    };
  }

  if (nonNullResults.length === 1) {
    const finalResult = applyModifiers(nonNullResults[0]!);
    return {
      childResults,
      fieldConstraints: { ...constraints, ...finalResult.fieldConstraints },
      isNullable,
      typeAnnotation: finalResult.typeAnnotation,
    };
  }

  const union = plugin.external('typing.Union');
  const itemTypes = nonNullResults.map(
    (r) => applyModifiers(r).typeAnnotation ?? plugin.external('typing.Any'),
  );

  if (isNullable) {
    itemTypes.push('None');
  }

  return {
    childResults,
    fieldConstraints: constraints,
    isNullable,
    typeAnnotation: $(union).slice(...itemTypes),
  };
}
