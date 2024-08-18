import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiItems } from './OpenApiItems';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#header-object
 */
export interface OpenApiHeader {
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes';
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
  items?: Dictionary<OpenApiItems>;
  maxItems?: number;
  maxLength?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minimum?: number;
  multipleOf?: number;
  pattern?: string;
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
  uniqueItems?: boolean;
}
