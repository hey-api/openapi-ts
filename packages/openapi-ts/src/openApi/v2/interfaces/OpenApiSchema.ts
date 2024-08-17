import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { WithEnumExtension } from '../../common/interfaces/WithEnumExtension';
import type { WithNullableExtension } from './Extensions/WithNullableExtension';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiXml } from './OpenApiXml';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#schema-object
 */
export interface OpenApiSchema
  extends OpenApiReference,
    WithEnumExtension,
    WithNullableExtension {
  additionalProperties?: boolean | OpenApiSchema;
  allOf?: OpenApiSchema[];
  default?: unknown;
  description?: string;
  discriminator?: string;
  enum?: (string | number)[];
  example?: unknown;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  externalDocs?: OpenApiExternalDocs;
  format?:
    | 'int32'
    | 'int64'
    | 'float'
    | 'double'
    | 'string'
    | 'boolean'
    | 'byte'
    | 'binary'
    | 'date'
    | 'date-time'
    | 'password';
  items?: OpenApiSchema;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  minimum?: number;
  multipleOf?: number;
  pattern?: string;
  properties?: Dictionary<OpenApiSchema>;
  readOnly?: boolean;
  required?: string[];
  title?: string;
  type?: string;
  uniqueItems?: boolean;
  xml?: OpenApiXml;
}
