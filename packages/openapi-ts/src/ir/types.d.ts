import type { JsonSchemaDraft2020_12 } from '../openApi/3.1.x/types/json-schema-draft-2020-12';
import type { SecuritySchemeObject } from '../openApi/3.1.x/types/spec';
import type { IRContext } from './context';
import type { IRMediaType } from './mediaType';

interface IRComponentsObject {
  parameters?: Record<string, IRParameterObject>;
  requestBodies?: Record<string, IRRequestBodyObject>;
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

interface IROperationObject {
  body?: IRBodyObject;
  deprecated?: boolean;
  description?: string;
  id: string;
  method: keyof IRPathItemObject;
  parameters?: IRParametersObject;
  path: keyof IRPathsObject;
  responses?: IRResponsesObject;
  security?: ReadonlyArray<IRSecurityObject>;
  // TODO: parser - add more properties
  // servers?: ReadonlyArray<ServerObject>;
  summary?: string;
  tags?: ReadonlyArray<string>;
}

interface IRBodyObject {
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

interface IRParametersObject {
  cookie?: Record<string, IRParameterObject>;
  header?: Record<string, IRParameterObject>;
  path?: Record<string, IRParameterObject>;
  query?: Record<string, IRParameterObject>;
}

interface IRParameterObject
  extends Pick<JsonSchemaDraft2020_12, 'deprecated' | 'description'> {
  /**
   * Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 `:/?#[]@!$&'()*+,;=` to be included without percent-encoding. The default value is `false`. This property SHALL be ignored if the request body media type is not `application/x-www-form-urlencoded` or `multipart/form-data`. If a value is explicitly defined, then the value of `contentType` (implicit or explicit) SHALL be ignored.
   */
  allowReserved?: boolean;
  /**
   * When this is true, property values of type `array` or `object` generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When `style` is `form`, the default value is `true`. For all other styles, the default value is `false`. This property SHALL be ignored if the request body media type is not `application/x-www-form-urlencoded` or `multipart/form-data`. If a value is explicitly defined, then the value of `contentType` (implicit or explicit) SHALL be ignored.
   */
  explode: boolean;
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
  /**
   * Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of `in`): for `query` - `form`; for `path` - `simple`; for `header` - `simple`; for `cookie` - `form`.
   */
  style:
    | 'deepObject'
    | 'form'
    | 'label'
    | 'matrix'
    | 'pipeDelimited'
    | 'simple'
    | 'spaceDelimited';
}

interface IRRequestBodyObject
  extends Pick<JsonSchemaDraft2020_12, 'description'> {
  required?: boolean;
  schema: IRSchemaObject;
}

interface IRResponsesObject {
  /**
   * Any {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#http-status-codes HTTP status code} can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character `X`. For example, `2XX` represents all response codes between `[200-299]`. Only the following range definitions are allowed: `1XX`, `2XX`, `3XX`, `4XX`, and `5XX`. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code.
   */
  [statusCode: string]: IRResponseObject | undefined;
  /**
   * The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses.
   */
  default?: IRResponseObject;
}

interface IRResponseObject {
  // TODO: parser - handle headers, links, and possibly other media types?
  mediaType?: string;
  schema: IRSchemaObject;
}

interface IRSchemaObject
  extends Pick<
    JsonSchemaDraft2020_12,
    | '$ref'
    | 'const'
    | 'default'
    | 'deprecated'
    | 'description'
    | 'exclusiveMaximum'
    | 'exclusiveMinimum'
    | 'maximum'
    | 'maxItems'
    | 'maxLength'
    | 'minimum'
    | 'minItems'
    | 'minLength'
    | 'pattern'
    | 'required'
    | 'title'
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
    | 'integer'
    | 'never'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'tuple'
    | 'undefined'
    | 'unknown'
    | 'void';
}

type IRSecurityObject = SecuritySchemeObject;

interface IRModel {
  components?: IRComponentsObject;
  paths?: IRPathsObject;
}

export namespace IR {
  export type BodyObject = IRBodyObject;
  export type ComponentsObject = IRComponentsObject;
  export type Context<Spec extends Record<string, any> = any> = IRContext<Spec>;
  export type Model = IRModel;
  export type OperationObject = IROperationObject;
  export type ParameterObject = IRParameterObject;
  export type ParametersObject = IRParametersObject;
  export type PathItemObject = IRPathItemObject;
  export type PathsObject = IRPathsObject;
  export type RequestBodyObject = IRRequestBodyObject;
  export type ResponseObject = IRResponseObject;
  export type ResponsesObject = IRResponsesObject;
  export type SchemaObject = IRSchemaObject;
  export type SecurityObject = IRSecurityObject;
}
