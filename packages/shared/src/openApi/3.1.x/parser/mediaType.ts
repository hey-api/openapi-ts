import type { IRMediaType } from '../../../ir/mediaType';
import { isMediaTypeFileLike, mediaTypeToIrMediaType } from '../../../ir/mediaType';
import type { MediaTypeObject, SchemaObject } from '../types/spec';

interface Content {
  mediaType: string;
  schema: SchemaObject | undefined;
  type: IRMediaType | undefined;
}

export const contentToSchema = ({ content }: { content: Content }): SchemaObject | undefined => {
  const { mediaType, schema } = content;

  if (!schema) {
    if (isMediaTypeFileLike({ mediaType })) {
      return {
        format: 'binary',
        type: 'string',
      };
    }
    return;
  }

  if (schema.type === 'string' && !schema.format && isMediaTypeFileLike({ mediaType })) {
    return {
      ...schema,
      format: 'binary',
    };
  }

  return schema;
};

export const mediaTypeObjects = ({
  content,
}: {
  content: Record<string, MediaTypeObject> | undefined;
}): ReadonlyArray<Content> => {
  const objects: Array<Content> = [];

  for (const mediaType in content) {
    objects.push({
      mediaType,
      schema: content[mediaType]!.schema,
      type: mediaTypeToIrMediaType({ mediaType }),
    });
  }

  return objects;
};
