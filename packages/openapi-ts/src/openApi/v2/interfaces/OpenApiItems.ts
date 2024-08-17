import type { WithEnumExtension } from '../../common/interfaces/WithEnumExtension';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#items-object)
 */
export interface OpenApiItems extends WithEnumExtension {
  collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes';
  default?: unknown;
  enum?: (string | number)[];
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
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
  items?: OpenApiItems;
  maxItems?: number;
  maxLength?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minimum?: number;
  multipleOf?: number;
  pattern?: string;
  type?: string;
  uniqueItems?: boolean;
}
