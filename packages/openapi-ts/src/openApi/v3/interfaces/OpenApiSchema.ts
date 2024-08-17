import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { WithEnumExtension } from '../../common/interfaces/WithEnumExtension';
import type { OpenApiDiscriminator } from './OpenApiDiscriminator';
import type { OpenApiExternalDocs } from './OpenApiExternalDocs';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiXml } from './OpenApiXml';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object
 */
export interface OpenApiSchema extends OpenApiReference, WithEnumExtension {
  additionalProperties?: boolean | OpenApiSchema;
  allOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  const?: string | number | boolean | null;
  default?: unknown;
  deprecated?: boolean;
  description?: string;
  discriminator?: OpenApiDiscriminator;
  enum?: (string | number)[];
  example?: unknown;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  externalDocs?: OpenApiExternalDocs;
  format?:
    | 'binary'
    | 'boolean'
    | 'byte'
    | 'date-time'
    | 'date'
    | 'double'
    | 'float'
    | 'int32'
    | 'int64'
    | 'password'
    | 'string';
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
  not?: OpenApiSchema[];
  nullable?: boolean;
  oneOf?: OpenApiSchema[];
  pattern?: string;
  prefixItems?: OpenApiSchema[];
  properties?: Dictionary<OpenApiSchema>;
  readOnly?: boolean;
  required?: string[];
  title?: string;
  type?: string | string[];
  uniqueItems?: boolean;
  writeOnly?: boolean;
  xml?: OpenApiXml;
}
