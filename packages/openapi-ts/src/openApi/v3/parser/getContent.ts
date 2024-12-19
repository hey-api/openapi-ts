import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiMediaType } from '../interfaces/OpenApiMediaType';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export interface Content {
  mediaType: string;
  schema: OpenApiSchema;
}

const BASIC_MEDIA_TYPES = [
  'application/json-patch+json',
  'application/json',
  'application/ld+json',
  'application/x-www-form-urlencoded',
  'multipart/batch',
  'multipart/form-data',
  'multipart/mixed',
  'multipart/related',
  'text/json',
  'text/plain',
];

export const getContent = (
  openApi: OpenApi,
  content: Dictionary<OpenApiMediaType>,
): Content | undefined => {
  const basicMediaTypeWithSchema = Object.keys(content)
    .filter((mediaType) => {
      const cleanMediaType = mediaType.split(';')[0]!.trim();
      return BASIC_MEDIA_TYPES.includes(cleanMediaType);
    })
    .find((mediaType) => Boolean(content[mediaType]?.schema));

  if (basicMediaTypeWithSchema) {
    return {
      mediaType: basicMediaTypeWithSchema,
      schema: content[basicMediaTypeWithSchema]!.schema as OpenApiSchema,
    };
  }

  const firstMediaTypeWithSchema = Object.keys(content).find((mediaType) =>
    Boolean(content[mediaType]?.schema),
  );

  if (firstMediaTypeWithSchema) {
    return {
      mediaType: firstMediaTypeWithSchema,
      schema: content[firstMediaTypeWithSchema]!.schema as OpenApiSchema,
    };
  }
};
