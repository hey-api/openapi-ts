import type { IRMediaType } from '../../../ir/mediaType';
import { mediaTypeToIrMediaType } from '../../../ir/mediaType';
import type {
  MediaTypeObject,
  ReferenceObject,
  SchemaObject,
} from '../types/spec';

interface Content {
  mediaType: string;
  schema: SchemaObject | ReferenceObject | undefined;
  type: IRMediaType | undefined;
}

export const mediaTypeObject = ({
  content,
}: {
  content: Record<string, MediaTypeObject> | undefined;
}): Content | undefined => {
  // return the first supported MIME type
  for (const mediaType in content) {
    return {
      mediaType,
      schema: content[mediaType].schema,
      type: mediaTypeToIrMediaType({ mediaType }),
    };
  }
};
