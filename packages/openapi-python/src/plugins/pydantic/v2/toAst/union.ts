import type { IR } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticFinal, PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

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
  const constraints: FieldConstraints = {};

  if (parentSchema.description !== undefined) {
    constraints.description = parentSchema.description;
  }

  const nonNullResults: Array<PydanticResult> = [];
  let isNullable = false;

  for (const result of childResults) {
    if (result.type === 'None') {
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
      type: 'None',
    };
  }

  if (nonNullResults.length === 1) {
    const finalResult = applyModifiers(nonNullResults[0]!);
    return {
      childResults,
      fieldConstraints: { ...constraints, ...finalResult.fieldConstraints },
      isNullable,
      type: finalResult.type,
    };
  }

  const union = plugin.external('typing.Union');
  const itemTypes = nonNullResults.map(
    (r) => applyModifiers(r).type ?? plugin.external('typing.Any'),
  );

  if (isNullable) {
    itemTypes.push('None');
  }

  return {
    childResults,
    fieldConstraints: constraints,
    isNullable,
    type: $(union).slice(...itemTypes),
  };
}
