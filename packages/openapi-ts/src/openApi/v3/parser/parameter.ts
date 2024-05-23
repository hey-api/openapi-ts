import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getParameterSchema = (
  definition: OpenApiParameter,
): OpenApiSchema | undefined => {
  if (definition.schema) {
    return definition.schema;
  }

  if (definition.content) {
    // treat every media type the same for now, types should be modified to
    // preserve this data so client knows which headers to use and how to
    // parse response bodies
    const contents = Object.entries(definition.content);
    for (const [key, mediaTypeObject] of contents) {
      if (mediaTypeObject.schema) {
        const mediaType = key as keyof Required<OpenApiParameter>['content'];
        return definition.content[mediaType].schema;
      }
    }
  }
};
