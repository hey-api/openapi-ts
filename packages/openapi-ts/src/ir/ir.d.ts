import type { JsonSchemaDraft2020_12 } from '../openApi/3.1.0/types/json-schema-draft-2020-12';
import type { IRMediaType } from './mediaType';

export interface IR {
  components?: IRComponentsObject;
  paths?: IRPathsObject;
}

interface IRComponentsObject {
  parameters?: Record<string, IRParameterObject>;
  schemas?: Record<string, IRSchemaObject>;
}

interface IRPathsObject {
  [path: `/${string}`]: IRPathItemObject;
}

interface IRPathItemObject {
  delete?: IROperationObject;
  get?: IROperationObject;
  head?: IROperationObject;
  options?: IROperationObject;
  patch?: IROperationObject;
  post?: IROperationObject;
  put?: IROperationObject;
  trace?: IROperationObject;
}

export interface IROperationObject {
  body?: IRBodyObject;
  deprecated?: boolean;
  description?: string;
  id: string;
  parameters?: IRParametersObject;
  responses?: IRResponsesObject;
  // TODO: parser - add more properties
  // security?: ReadonlyArray<SecurityRequirementObject>;
  // servers?: ReadonlyArray<ServerObject>;
  summary?: string;
  tags?: ReadonlyArray<string>;
}

export interface IRBodyObject {
  mediaType: string;
  /**
   * Does body control pagination? We handle only simple values
   * for now, up to 1 nested field.
   */
  pagination?: boolean | string;
  required?: boolean;
  schema: IRSchemaObject;
  type?: IRMediaType;
}

export interface IRParametersObject {
  cookie?: Record<string, IRParameterObject>;
  header?: Record<string, IRParameterObject>;
  path?: Record<string, IRParameterObject>;
  query?: Record<string, IRParameterObject>;
}

export interface IRParameterObject {
  /**
   * Endpoint parameters must specify their location.
   */
  location: 'cookie' | 'header' | 'path' | 'query';
  name: string;
  /**
   * Does this parameter control pagination? We handle only simple values
   * for now, up to 1 nested field.
   */
  pagination?: boolean | string;
  required?: boolean;
  schema: IRSchemaObject;
}

export interface IRResponsesObject {
  /**
   * Any {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#http-status-codes HTTP status code} can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character `X`. For example, `2XX` represents all response codes between `[200-299]`. Only the following range definitions are allowed: `1XX`, `2XX`, `3XX`, `4XX`, and `5XX`. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code.
   */
  [statusCode: string]: IRResponseObject | undefined;
  /**
   * The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses.
   */
  default?: IRResponseObject;
}

export interface IRResponseObject {
  // TODO: parser - handle headers, links, and possibly other media types?
  schema: IRSchemaObject;
}

export interface IRSchemaObject
  extends Pick<
    JsonSchemaDraft2020_12,
    '$ref' | 'const' | 'deprecated' | 'description' | 'required' | 'title'
  > {
  /**
   * If the schema is intended to be used as an object property, it can be
   * marked as read-only or write-only.
   */
  accessScope?: 'read' | 'write';
  /**
   * If type is `object`, `additionalProperties` can be used to either define
   * a schema for properties not included in `properties` or disallow such
   * properties altogether.
   */
  additionalProperties?: IRSchemaObject | false;
  /**
   * Any string value is accepted as `format`.
   */
  format?: JsonSchemaDraft2020_12['format'] | 'binary' | 'integer';
  /**
   * If schema resolves into multiple items instead of a simple `type`, they
   * will be included in `items` array.
   */
  items?: ReadonlyArray<IRSchemaObject>;
  /**
   * When resolving a list of items, we need to know the relationship between
   * them. `logicalOperator` specifies this logical relationship.
   * @default 'or'
   */
  logicalOperator?: 'and' | 'or';
  /**
   * When type is `object`, `properties` will contain a map of its properties.
   */
  properties?: Record<string, IRSchemaObject>;
  /**
   * Each schema eventually resolves into `type`.
   */
  type?:
    | 'array'
    | 'boolean'
    | 'enum'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'tuple'
    | 'unknown'
    | 'void';
}
