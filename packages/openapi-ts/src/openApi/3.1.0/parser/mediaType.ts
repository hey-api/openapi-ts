import type { MediaTypeObject, SchemaObject } from '../types/spec';

const SUPPORTED_MEDIA_TYPES = [
  'application/json-patch+json',
  'application/json',
  'application/ld+json',
  'application/x-www-form-urlencoded',
  'audio/*',
  'multipart/batch',
  'multipart/form-data',
  'multipart/mixed',
  'multipart/related',
  'text/json',
  'text/plain',
  'video/*',
] as const;

type MediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

interface Content {
  mediaType: MediaType;
  schema: SchemaObject | undefined;
}

export const getMediaTypeSchema = ({
  content,
}: {
  content: Record<string, MediaTypeObject> | undefined;
}): Content | undefined => {
  for (const rawMediaType in content) {
    const mediaTypeContent = content[rawMediaType];
    const mediaType: MediaType = rawMediaType.split(';')[0].trim() as MediaType;
    if (SUPPORTED_MEDIA_TYPES.includes(mediaType)) {
      return {
        mediaType,
        schema: mediaTypeContent.schema,
      };
    }
  }
};
