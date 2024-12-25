import type { Config } from '../../../types/config';
import type { OpenApiParameter } from '../../v3/interfaces/OpenApiParameter';

export interface ModelComposition
  extends Pick<Model, '$refs' | 'enums' | 'imports' | 'properties'> {
  export: Extract<Model['export'], 'all-of' | 'any-of' | 'one-of'>;
}

export interface Enum {
  customDescription?: string;
  customName?: string;
  description?: string;
  value: string | number;
}

export interface OperationParameter extends Model {
  in: 'body' | 'cookie' | 'formData' | 'header' | 'path' | 'query';
  mediaType: string | null;
  prop: string;
}

export interface OperationParameters extends Pick<Model, '$refs' | 'imports'> {
  parameters: OperationParameter[];
  parametersBody: OperationParameter | null;
  parametersCookie: OperationParameter[];
  parametersForm: OperationParameter[];
  parametersHeader: OperationParameter[];
  parametersPath: OperationParameter[];
  parametersQuery: OperationParameter[];
}

export interface OperationResponse extends Model {
  code: number | 'default' | '1XX' | '2XX' | '3XX' | '4XX' | '5XX';
  in: 'header' | 'response';
  responseTypes: Array<'error' | 'success'>;
}

export type Method =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';

export interface Operation extends OperationParameters {
  deprecated: boolean;
  description: string | null;
  /**
   * The operationId from OpenAPI specification.
   */
  id: string | null;
  method: Method;
  name: string;
  path: string;
  responseHeader: string | null;
  /**
   * All operation responses defined in OpenAPI specification.
   * Sorted by status code.
   */
  responses: OperationResponse[];
  summary: string | null;
  tags: string[] | null;
}

export interface Schema {
  default?: unknown;
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
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
  isDefinition: boolean;
  isNullable: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
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
  uniqueItems?: boolean;
}

export interface ModelMeta {
  /**
   * Ref to the type in OpenAPI specification.
   */
  $ref: string;
  /**
   * Name passed to the initial `getModel()` call.
   */
  name: string;
}

export interface Model extends Schema {
  /**
   * **Experimental.** Contains list of original refs so they can be used
   * to access the schema from anywhere instead of relying on string name.
   * This allows us to do things like detect type of ref.
   */
  $refs: string[];
  base: string;
  deprecated?: boolean;
  description: string | null;
  enum: Enum[];
  enums: Model[];
  export:
    | 'all-of'
    | 'any-of'
    | 'array'
    | 'const'
    | 'dictionary'
    | 'enum'
    | 'generic'
    | 'interface'
    | 'one-of'
    | 'reference';
  imports: string[];
  in:
    | OperationParameter['in']
    | OpenApiParameter['in']
    | OperationResponse['in']
    | '';
  link: Model | Model[] | null;
  meta?: ModelMeta;
  /**
   * @deprecated use `meta.name` instead
   */
  name: string;
  properties: Model[];
  template: string | null;
  type: string;
}

export interface Client {
  /**
   * Configuration for parsing and generating the output. This
   * is a mix of user-provided and default values.
   */
  config: Config;
  models: Model[];
  operations: Operation[];
  server: string;
  /**
   * Map of generated types where type names are keys. This is used to track
   * uniquely generated types as we may want to deduplicate if there are
   * multiple definitions with the same name but different value, or if we
   * want to transform names.
   */
  types: Record<string, ModelMeta>;
  version: string;
}
