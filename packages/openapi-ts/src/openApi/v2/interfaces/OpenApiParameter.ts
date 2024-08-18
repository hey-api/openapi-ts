import type { WithEnumExtension } from '../../common/interfaces/WithEnumExtension';
import type { WithNullableExtension } from './Extensions/WithNullableExtension';
import type { OpenApiItems } from './OpenApiItems';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#parameter-object
 */
export interface OpenApiParameter
  extends OpenApiReference,
    WithEnumExtension,
    WithNullableExtension {
  allowEmptyValue?: boolean;
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
  default?: unknown;
  description?: string;
  enum?: (string | number)[];
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
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
  in: 'path' | 'query' | 'header' | 'formData' | 'body';
  items?: OpenApiItems;
  maxItems?: number;
  maxLength?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minimum?: number;
  multipleOf?: number;
  name: string;
  pattern?: string;
  required?: boolean;
  schema?: OpenApiSchema;
  type?: string;
  uniqueItems?: boolean;
}
