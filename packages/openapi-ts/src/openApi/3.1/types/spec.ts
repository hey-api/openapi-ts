/**
 * This is the root object of the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#openapi-document OpenAPI document}.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 */
export interface OpenApiV3_1 {
  /**
   * An element to hold various schemas for the document.
   */
  components?: any;
  /**
   * Additional external documentation.
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * **REQUIRED**. Provides metadata about the API. The metadata MAY be used by tooling as required.
   */
  info: InfoObject;
  /**
   * The default value for the `$schema` keyword within {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object Schema Objects} contained within this OAS document. This MUST be in the form of a URI.
   */
  jsonSchemaDialect?: string;
  /**
   * **REQUIRED**. This string MUST be the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#versions version number} of the OpenAPI Specification that the OpenAPI document uses. The `openapi` field SHOULD be used by tooling to interpret the OpenAPI document. This is _not_ related to the API {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#infoVersion info.version} string.
   */
  openapi: '3.1.0';
  /**
   * The available paths and operations for the API.
   */
  paths?: any;
  /**
   * A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement (`{}`) can be included in the array.
   */
  security?: ReadonlyArray<SecurityRequirementObject>;
  /**
   * An array of Server Objects, which provide connectivity information to a target server. If the `servers` property is not provided, or is an empty array, the default value would be a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#server-object Server Object} with a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#serverUrl url} value of `/`.
   */
  servers?: ReadonlyArray<ServerObject>;
  /**
   * A list of tags used by the document with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#operation-object Operation Object} must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique.
   */
  tags?: ReadonlyArray<TagObject>;
  /**
   * The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement. Closely related to the `callbacks` feature, this section describes requests initiated other than by an API call, for example by an out of band registration. The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses. An {@link https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.1/webhook-example.yaml example} is available.
   */
  webhooks?: Record<string, PathItemObject | ReferenceObject>;
}

/**
 * Allows referencing an external resource for extended documentation.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * description: Find more info here
 * url: https://example.com
 * ```
 */
interface ExternalDocumentationObject {
  /**
   * A description of the target documentation. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * **REQUIRED**. The URL for the target documentation. This MUST be in the form of a URL.
   */
  url: string;
}

/**
 * The Header Object follows the structure of the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-object Parameter Object} with the following changes:
 *
 * 1. `name` MUST NOT be specified, it is given in the corresponding `headers` map.
 * 1. `in` MUST NOT be specified, it is implicitly in `header`.
 * 1. All traits that are affected by the location MUST be applicable to a location of `header` (for example, {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterStyle `style`}).
 *
 * @example
 * ```yaml
 * description: The number of allowed requests in the current period
 * schema:
 *   type: integer
 * ```
 */
interface HeaderObject extends Omit<ParameterObject, 'in' | 'name'> {}

/**
 * The object provides metadata about the API. The metadata MAY be used by the clients if needed, and MAY be presented in editing or documentation generation tools for convenience.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * title: Sample Pet Store App
 * summary: A pet store manager.
 * description: This is a sample server for a pet store.
 * termsOfService: https://example.com/terms/
 * contact:
 *   name: API Support
 *   url: https://www.example.com/support
 *   email: support@example.com
 * license:
 *   name: Apache 2.0
 *   url: https://www.apache.org/licenses/LICENSE-2.0.html
 * version: 1.0.1
 * ```
 */
interface InfoObject {
  /**
   * The contact information for the exposed API.
   */
  contact?: ContactObject;
  /**
   * A description of the API. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * The license information for the exposed API.
   */
  license?: LicenseObject;
  /**
   * A short summary of the API.
   */
  summary?: string;
  /**
   * A URL to the Terms of Service for the API. This MUST be in the form of a URL.
   */
  termsOfService?: string;
  /**
   * **REQUIRED**. The title of the API.
   */
  title: string;
  /**
   * **REQUIRED**. The version of the OpenAPI document (which is distinct from the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oasVersion OpenAPI Specification version} or the API implementation version).
   */
  version: string;
}

/**
 * Contact information for the exposed API.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * name: API Support
 * url: https://www.example.com/support
 * email: support@example.com
 * ```
 */
interface ContactObject {
  /**
   * The email address of the contact person/organization. This MUST be in the form of an email address.
   */
  email?: string;
  /**
   * The identifying name of the contact person/organization.
   */
  name?: string;
  /**
   * The URL pointing to the contact information. This MUST be in the form of a URL.
   */
  url?: string;
}

/**
 * License information for the exposed API.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * name: Apache 2.0
 * identifier: Apache-2.0
 * ```
 */
interface LicenseObject {
  /**
   * An {@link https://spdx.org/licenses/ SPDX} license expression for the API. The `identifier` field is mutually exclusive of the `url` field.
   */
  identifier?: string;
  /**
   * **REQUIRED**. The license name used for the API.
   */
  name: string;
  /**
   * A URL to the license used for the API. This MUST be in the form of a URL. The `url` field is mutually exclusive of the `identifier` field.
   */
  url?: string;
}

/**
 * Each Media Type Object provides schema and examples for the media type identified by its key.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * application/json:
 *   schema:
 *     $ref: "#/components/schemas/Pet"
 *   examples:
 *     cat:
 *       summary: An example of a cat
 *       value:
 *         name: Fluffy
 *         petType: Cat
 *         color: White
 *         gender: male
 *         breed: Persian
 *     dog:
 *       summary: An example of a dog with a cat's name
 *       value:
 *         name: Puma
 *         petType: Dog
 *         color: Black
 *         gender: Female
 *         breed: Mixed
 *     frog:
 *       $ref: "#/components/examples/frog-example"
 * ```
 */
interface MediaTypeObject {
  /**
   * A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to `requestBody` objects when the media type is `multipart` or `application/x-www-form-urlencoded`.
   */
  encoding?: Record<string, any>;
  /**
   * Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The `example` field is mutually exclusive of the `examples` field. Furthermore, if referencing a `schema` which contains an example, the `example` value SHALL _override_ the example provided by the schema.
   */
  example?: unknown;
  /**
   * Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The `examples` field is mutually exclusive of the `example` field. Furthermore, if referencing a `schema` which contains an example, the `examples` value SHALL _override_ the example provided by the schema.
   */
  examples?: Record<string, any | ReferenceObject>;
  /**
   * The schema defining the content of the request, response, or parameter.
   */
  schema?: any;
}

/**
 * Describes a single API operation on a path.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * tags:
 * - pet
 * summary: Updates a pet in the store with form data
 * operationId: updatePetWithForm
 * parameters:
 * - name: petId
 *   in: path
 *   description: ID of pet that needs to be updated
 *   required: true
 *   schema:
 *     type: string
 * requestBody:
 *   content:
 *     'application/x-www-form-urlencoded':
 *       schema:
 *         type: object
 *         properties:
 *           name:
 *             description: Updated name of the pet
 *             type: string
 *           status:
 *             description: Updated status of the pet
 *             type: string
 *         required:
 *           - status
 * responses:
 *   '200':
 *     description: Pet updated.
 *     content:
 *       'application/json': {}
 *       'application/xml': {}
 *   '405':
 *     description: Method Not Allowed
 *     content:
 *       'application/json': {}
 *       'application/xml': {}
 * security:
 * - petstore_auth:
 *   - write:pets
 *   - read:pets
 * ```
 */
interface OperationObject {
  /**
   * A map of possible out-of band callbacks related to the parent operation. The key is a unique identifier for the Callback Object. Each value in the map is a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#callback-object Callback Object} that describes a request that may be initiated by the API provider and the expected responses.
   */
  callbacks?: Record<string, any | ReferenceObject>;
  /**
   * Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is `false`.
   */
  deprecated?: boolean;
  /**
   * A verbose explanation of the operation behavior. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * Additional external documentation for this operation.
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * Unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is **case-sensitive**. Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
   */
  operationId?: string;
  /**
   * A list of parameters that are applicable for this operation. If a parameter is already defined at the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#pathItemParameters Path Item}, the new definition will override it but can never remove it. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterName name} and {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn location}. The list can use the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#reference-object Reference Object} to link to parameters that are defined at the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#componentsParameters OpenAPI Object's components/parameters}.
   */
  parameters?: ReadonlyArray<ParameterObject | ReferenceObject>;
  /**
   * The request body applicable for this operation. The `requestBody` is fully supported in HTTP methods where the HTTP 1.1 specification {@link https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.1 RFC7231} has explicitly defined semantics for request bodies. In other cases where the HTTP spec is vague (such as {@link https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.1 GET}, {@link https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.2 HEAD} and {@link https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.5 DELETE}), `requestBody` is permitted but does not have well-defined semantics and SHOULD be avoided if possible.
   */
  requestBody?: any | ReferenceObject;
  /**
   * The list of possible responses as they are returned from executing this operation.
   */
  responses?: ResponsesObject;
  /**
   * A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement (`{}`) can be included in the array. This definition overrides any declared top-level {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#oasSecurity `security`}. To remove a top-level security declaration, an empty array can be used.
   */
  security?: ReadonlyArray<SecurityRequirementObject>;
  /**
   * An alternative `server` array to service this operation. If an alternative `server` object is specified at the Path Item Object or Root level, it will be overridden by this value.
   */
  servers?: ReadonlyArray<ServerObject>;
  /**
   * A short summary of what the operation does.
   */
  summary?: string;
  /**
   * A list of tags for API documentation control. Tags can be used for logical grouping of operations by resources or any other qualifier.
   */
  tags?: ReadonlyArray<string>;
}

/**
 * Describes a single operation parameter.
 *
 * A unique parameter is defined by a combination of a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterName name} and {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn location}.
 *
 * **Parameter Locations**
 *
 * There are four possible parameter locations specified by the `in` field:
 *
 * - path - Used together with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#path-templating Path Templating}, where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in `/items/{itemId}`, the path parameter is `itemId`.
 * - query - Parameters that are appended to the URL. For example, in `/items?id=###`, the query parameter is `id`.
 * - header - Custom headers that are expected as part of the request. Note that {@link https://datatracker.ietf.org/doc/html/rfc7230#page-22 RFC7230} states header names are case insensitive.
 * - cookie - Used to pass a specific cookie value to the API.
 *
 * The rules for serialization of the parameter are specified in one of two ways. For simpler scenarios, a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterSchema `schema`} and {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterStyle `style`} can describe the structure and syntax of the parameter.
 *
 * For more complex scenarios, the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterContent `content`} property can define the media type and schema of the parameter. A parameter MUST contain either a `schema` property, or a `content` property, but not both. When `example` or `examples` are provided in conjunction with the `schema` object, the example MUST follow the prescribed serialization strategy for the parameter.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * A header parameter with an array of 64 bit integer numbers:
 *
 * @example
 * ```yaml
 * name: token
 * in: header
 * description: token to be passed as a header
 * required: true
 * schema:
 *   type: array
 *   items:
 *     type: integer
 *     format: int64
 * style: simple
 * ```
 *
 * A path parameter of a string value:
 *
 * @example
 * ```yaml
 * name: username
 * in: path
 * description: username to fetch
 * required: true
 * schema:
 *   type: string
 * ```
 *
 * An optional query parameter of a string value, allowing multiple values by repeating the query parameter:
 *
 * @example
 * ```yaml
 * name: id
 * in: query
 * description: ID of the object to fetch
 * required: false
 * schema:
 *   type: array
 *   items:
 *     type: string
 * style: form
 * explode: true
 * ```
 *
 * A free-form query parameter, allowing undefined parameters of a specific type:
 *
 * @example
 * ```yaml
 * in: query
 * name: freeForm
 * schema:
 *   type: object
 *   additionalProperties:
 *     type: integer
 * style: form
 * ```
 *
 * A complex parameter using `content` to define serialization:
 *
 * @example
 * ```yaml
 * in: query
 * name: coordinates
 * content:
 *   application/json:
 *     schema:
 *       type: object
 *       required:
 *         - lat
 *         - long
 *       properties:
 *         lat:
 *           type: number
 *         long:
 *           type: number
 * ```
 */
interface ParameterObject {
  /**
   * Sets the ability to pass empty-valued parameters. This is valid only for `query` parameters and allows sending a parameter with an empty value. Default value is `false`. If {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterStyle `style`} is used, and if behavior is `n/a` (cannot be serialized), the value of `allowEmptyValue` SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
   */
  allowEmptyValue?: boolean;
  /**
   * Determines whether the parameter value SHOULD allow reserved characters, as defined by {@link https://datatracker.ietf.org/doc/html/rfc3986#section-2.2 RFC3986} `:/?#[]@!$&'()*+,;=` to be included without percent-encoding. This property only applies to parameters with an `in` value of `query`. The default value is `false`.
   */
  allowReserved?: boolean;
  /**
   * A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry.
   */
  content?: Record<string, any>;
  /**
   * Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is `false`.
   */
  deprecated?: boolean;
  /**
   * A brief description of the parameter. This could contain examples of use. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * Example of the parameter's potential value. The example SHOULD match the specified schema and encoding properties if present. The `example` field is mutually exclusive of the `examples` field. Furthermore, if referencing a `schema` that contains an example, the `example` value SHALL _override_ the example provided by the schema. To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary.
   */
  example?: unknown;
  /**
   * Examples of the parameter's potential value. Each example SHOULD contain a value in the correct format as specified in the parameter encoding. The `examples` field is mutually exclusive of the `example` field. Furthermore, if referencing a `schema` that contains an example, the `examples` value SHALL _override_ the example provided by the schema.
   */
  examples?: Record<string, any | ReferenceObject>;
  /**
   * When this is true, parameter values of type `array` or `object` generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterStyle `style`} is `form`, the default value is `true`. For all other styles, the default value is `false`.
   */
  explode?: boolean;
  /**
   * **REQUIRED**. The location of the parameter. Possible values are `"query"`, `"header"`, `"path"` or `"cookie"`.
   */
  in: 'cookie' | 'header' | 'path' | 'query';
  /**
   * **REQUIRED**. The name of the parameter. Parameter names are _case sensitive_.
   * - If {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn `in`} is `"path"`, the `name` field MUST correspond to a template expression occurring within the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#pathsPath path} field in the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#paths-object Paths Object}. See {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#path-templating Path Templating} for further information.
   * - If {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn `in`} is `"header"` and the `name` field is `"Accept"`, `"Content-Type"` or `"Authorization"`, the parameter definition SHALL be ignored.
   * - For all other cases, the `name` corresponds to the parameter name used by the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn `in`} property.
   */
  name: string;
  /**
   * Determines whether this parameter is mandatory. If the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn parameter location} is `"path"`, this property is **REQUIRED** and its value MUST be `true`. Otherwise, the property MAY be included and its default value is `false`.
   */
  required?: boolean;
  /**
   * The schema defining the type used for the parameter.
   */
  schema?: any;
  /**
   * Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of `in`): for `query` - `form`; for `path` - `simple`; for `header` - `simple`; for `cookie` - `form`.
   */
  style?:
    | 'deepObject'
    | 'form'
    | 'label'
    | 'matrix'
    | 'pipeDelimited'
    | 'simple'
    | 'spaceDelimited';
}

/**
 * Describes the operations available on a single path. A Path Item MAY be empty, due to {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#security-filtering ACL constraints}. The path itself is still exposed to the documentation viewer but they will not know which operations and parameters are available.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * get:
 *   description: Returns pets based on ID
 *   summary: Find pets by ID
 *   operationId: getPetsById
 *   responses:
 *     '200':
 *       description: pet response
 *       content:
 *         '*\/*':
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Pet'
 *     default:
 *       description: error payload
 *       content:
 *         'text/html':
 *           schema:
 *             $ref: '#/components/schemas/ErrorModel'
 * parameters:
 * - name: id
 *   in: path
 *   description: ID of pet to use
 *   required: true
 *   schema:
 *     type: array
 *     items:
 *       type: string
 *   style: simple
 * ```
 */
interface PathItemObject {
  /**
   * Allows for a referenced definition of this path item. The referenced structure MUST be in the form of a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#path-item-object Path Item Object}. In case a Path Item Object field appears both in the defined object and the referenced object, the behavior is undefined. See the rules for resolving {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#relative-references-in-uris Relative References}.
   */
  $ref?: string;
  /**
   * A definition of a DELETE operation on this path.
   */
  delete?: OperationObject;
  /**
   * An optional, string description, intended to apply to all operations in this path. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * A definition of a GET operation on this path.
   */
  get?: OperationObject;
  /**
   * A definition of a HEAD operation on this path.
   */
  head?: OperationObject;
  /**
   * A definition of a OPTIONS operation on this path.
   */
  options?: OperationObject;
  /**
   * A list of parameters that are applicable for all the operations described under this path. These parameters can be overridden at the operation level, but cannot be removed there. The list MUST NOT include duplicated parameters. A unique parameter is defined by a combination of a {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterName name} and {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterIn location}. The list can use the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#reference-object Reference Object} to link to parameters that are defined at the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#componentsParameters OpenAPI Object's components/parameters}.
   */
  parameters?: ReadonlyArray<ParameterObject | ReferenceObject>;
  /**
   * A definition of a PATCH operation on this path.
   */
  patch?: OperationObject;
  /**
   * A definition of a POST operation on this path.
   */
  post?: OperationObject;
  /**
   * A definition of a PUT operation on this path.
   */
  put?: OperationObject;
  /**
   * An alternative `server` array to service all operations in this path.
   */
  servers?: ReadonlyArray<ServerObject>;
  /**
   * An optional, string summary, intended to apply to all operations in this path.
   */
  summary?: string;
  /**
   * A definition of a TRACE operation on this path.
   */
  trace?: OperationObject;
}

/**
 * A simple object to allow referencing other components in the OpenAPI document, internally and externally.
 *
 * The `$ref` string value contains a URI {@link https://datatracker.ietf.org/doc/html/rfc3986 RFC3986}, which identifies the location of the value being referenced.
 *
 * See the rules for resolving {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#relative-references-in-uris Relative References}.
 *
 * This object cannot be extended with additional properties and any properties added SHALL be ignored.
 *
 * Note that this restriction on additional properties is a difference between Reference Objects and {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object `Schema Objects`} that contain a `$ref` keyword.
 *
 * Reference Object Example
 *
 * @example
 * ```yaml
 * $ref: '#/components/schemas/Pet'
 * ```
 *
 * Relative Schema Document Example
 *
 * @example
 * ```yaml
 * $ref: Pet.yaml
 * ```
 *
 * Relative Documents With Embedded Schema Example
 *
 * @example
 * ```yaml
 * $ref: definitions.yaml#/Pet
 * ```
 */
interface ReferenceObject {
  /**
   * **REQUIRED**. The reference identifier. This MUST be in the form of a URI.
   */
  $ref: string;
  /**
   * A description which by default SHOULD override that of the referenced component. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation. If the referenced object-type does not allow a `description` field, then this field has no effect.
   */
  description?: string;
  /**
   * A short summary which by default SHOULD override that of the referenced component. If the referenced object-type does not allow a `summary` field, then this field has no effect.
   */
  summary?: string;
}

/**
 * Describes a single response from an API Operation, including design-time, static `links` to operations based on the response.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * Response of an array of a complex type:
 *
 * @example
 * ```yaml
 * description: A complex object array response
 * content:
 *   application/json:
 *     schema:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/VeryComplexType'
 * ```
 *
 * Response with a string type:
 *
 * @example
 * ```yaml
 * description: A simple string response
 * content:
 *   text/plain:
 *     schema:
 *       type: string
 * ```
 *
 * Plain text response with headers:
 *
 * @example
 * ```yaml
 * description: A simple string response
 * content:
 *   text/plain:
 *     schema:
 *       type: string
 *     example: 'whoa!'
 * headers:
 *   X-Rate-Limit-Limit:
 *     description: The number of allowed requests in the current period
 *     schema:
 *       type: integer
 *   X-Rate-Limit-Remaining:
 *     description: The number of remaining requests in the current period
 *     schema:
 *       type: integer
 *   X-Rate-Limit-Reset:
 *     description: The number of seconds left in the current period
 *     schema:
 *       type: integer
 * ```
 *
 * Response with no return value:
 *
 * @example
 * ```yaml
 * description: object created
 * ```
 */
interface ResponseObject {
  /**
   * A map containing descriptions of potential response payloads. The key is a media type or {@link https://datatracker.ietf.org/doc/html/rfc7231#appendix-D media type range} and the value describes it. For responses that match multiple keys, only the most specific key is applicable. e.g. text/plain overrides text/*
   */
  content?: Record<string, MediaTypeObject>;
  /**
   * **REQUIRED**. A description of the response. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description: string;
  /**
   * Maps a header name to its definition. {@link https://datatracker.ietf.org/doc/html/rfc7230#page-22 RFC7230} states header names are case insensitive. If a response header is defined with the name `"Content-Type"`, it SHALL be ignored.
   */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /**
   * A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#components-object Component Objects}.
   */
  links?: Record<string, any | ReferenceObject>;
}

/**
 * A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
 *
 * The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
 *
 * The `default` MAY be used as a default response object for all HTTP codes that are not covered individually by the `Responses Object`.
 *
 * The `Responses Object` MUST contain at least one response code, and if only one response code is provided it SHOULD be the response for a successful operation call.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * A 200 response for a successful operation and a default response for others (implying an error):
 *
 * @example
 * ```yaml
 * '200':
 *   description: a pet to be returned
 *   content:
 *     application/json:
 *       schema:
 *         $ref: '#/components/schemas/Pet'
 * default:
 *   description: Unexpected error
 *   content:
 *     application/json:
 *       schema:
 *         $ref: '#/components/schemas/ErrorModel'
 * ```
 */
interface ResponsesObject {
  /**
   * Any {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#http-status-codes HTTP status code} can be used as the property name, but only one property per code, to describe the expected response for that HTTP status code. This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML. To define a range of response codes, this field MAY contain the uppercase wildcard character `X`. For example, `2XX` represents all response codes between `[200-299]`. Only the following range definitions are allowed: `1XX`, `2XX`, `3XX`, `4XX`, and `5XX`. If a response is defined using an explicit code, the explicit code definition takes precedence over the range definition for that code.
   */
  [statusCode: string]: ResponseObject | ReferenceObject | undefined;
  /**
   * The documentation of responses other than the ones declared for specific HTTP response codes. Use this field to cover undeclared responses.
   */
  default?: ResponseObject | ReferenceObject;
}

/**
 * Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#componentsSecuritySchemes Security Schemes} under the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#components-object Components Object}.
 *
 * Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.
 *
 * When a list of Security Requirement Objects is defined on the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#openapi-object OpenAPI Object} or {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#operation-object Operation Object}, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
 *
 * Non-OAuth2 Security Requirement
 *
 * @example
 * ```yaml
 * api_key: []
 * ```
 *
 * OAuth2 Security Requirement
 *
 * @example
 * ```yaml
 * petstore_auth:
 * - write:pets
 * - read:pets
 * ```
 *
 * Optional OAuth2 Security
 *
 * @example
 * ```yaml
 * security:
 * - {}
 * - petstore_auth:
 *   - write:pets
 *   - read:pets
 * ```
 */
interface SecurityRequirementObject {
  /**
   * Each name MUST correspond to a security scheme which is declared in the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#componentsSecuritySchemes Security Schemes} under the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#components-object Components Object}. If the security scheme is of type `"oauth2"` or `"openIdConnect"`, then the value is a list of scope names required for the execution, and the list MAY be empty if authorization does not require a specified scope. For other security scheme types, the array MAY contain a list of role names which are required for the execution, but are not otherwise defined or exchanged in-band.
   */
  [name: string]: ReadonlyArray<string>;
}

/**
 * An object representing a Server.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * url: https://development.gigantic-server.com/v1
 * description: Development server
 * ```
 */
interface ServerObject {
  /**
   * An optional string describing the host designated by the URL. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * **REQUIRED**. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in `{`brackets`}`.
   */
  url: string;
  /**
   * A map between a variable name and its value. The value is used for substitution in the server's URL template.
   */
  variables?: Record<string, ServerVariableObject>;
}

/**
 * An object representing a Server Variable for server URL template substitution.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 */
interface ServerVariableObject {
  /**
   * **REQUIRED**. The default value to use for substitution, which SHALL be sent if an alternate value is _not_ supplied. Note this behavior is different than the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#schema-object Schema Object's} treatment of default values, because in those cases parameter values are optional. If the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#serverVariableEnum `enum`} is defined, the value MUST exist in the enum's values.
   */
  default: string;
  /**
   * An optional description for the server variable. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * An enumeration of string values to be used if the substitution options are from a limited set. The array MUST NOT be empty.
   */
  enum?: ReadonlyArray<string>;
}

/**
 * Adds metadata to a single tag that is used by the {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#operation-object Operation Object}. It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.
 *
 * This object MAY be extended with {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 *
 * @example
 * ```yaml
 * name: pet
 * description: Pets operations
 * ```
 */
interface TagObject {
  /**
   * A description for the tag. {@link https://spec.commonmark.org/ CommonMark syntax} MAY be used for rich text representation.
   */
  description?: string;
  /**
   * Additional external documentation for this tag.
   */
  externalDocs?: ExternalDocumentationObject;
  /**
   * **REQUIRED**. The name of the tag.
   */
  name: string;
}
