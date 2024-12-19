import type { Model } from '../../common/interfaces/client';
import type { OpenApiParameter } from '../../v2/interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../../v3/interfaces/OpenApiSchema';
import { getDefinitionTypes } from '../../v3/parser/inferType';
import type { OperationParameter } from '../interfaces/client';

export const getDefault = (
  definition: OpenApiSchema | OpenApiParameter,
  model?: Model | OperationParameter,
): unknown | undefined => {
  if (definition.default === undefined || definition.default === null) {
    return definition.default;
  }

  const definitionTypes = getDefinitionTypes(definition);

  const type =
    definitionTypes.find((type) => type !== 'null') ||
    typeof definition.default;

  switch (type) {
    case 'int':
    case 'integer':
    case 'number':
      if (
        model?.export === 'enum' &&
        model.enum?.[definition.default as number]
      ) {
        const { value } = model.enum[definition.default as number]!;
        return value;
      }
      return definition.default;
    case 'array':
    case 'boolean':
    case 'object':
    case 'string':
      return definition.default;
    default:
      return undefined;
  }
};
