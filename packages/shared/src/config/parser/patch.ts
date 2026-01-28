import type { MaybeFunc } from '@hey-api/types';

import type {
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from '../../openApi/types';

export type Patch = {
  /**
   * Patch the OpenAPI meta object in place. Useful for modifying general metadata such as title, description, version, or custom fields before further processing.
   *
   * @param meta The OpenAPI meta object for the current version.
   */
  meta?: (
    meta:
      | OpenApiMetaObject.V2_0_X
      | OpenApiMetaObject.V3_0_X
      | OpenApiMetaObject.V3_1_X,
  ) => void;
  /**
   * Patch OpenAPI operations in place. The key is the operation method and operation path, and the function receives the operation object to modify directly.
   *
   * @example
   * operations: {
   *   'GET /foo': (operation) => {
   *     operation.responses['200'].description = 'foo';
   *   }
   * }
   */
  operations?: Record<
    string,
    (
      operation:
        | OpenApiOperationObject.V2_0_X
        | OpenApiOperationObject.V3_0_X
        | OpenApiOperationObject.V3_1_X,
    ) => void
  >;
  /**
   * Patch OpenAPI parameters in place. The key is the parameter name, and the function receives the parameter object to modify directly.
   *
   * @example
   * parameters: {
   *   limit: (parameter) => {
   *     parameter.schema.type = 'integer';
   *   }
   * }
   */
  parameters?: Record<
    string,
    (
      parameter: OpenApiParameterObject.V3_0_X | OpenApiParameterObject.V3_1_X,
    ) => void
  >;
  /**
   * Patch OpenAPI request bodies in place. The key is the request body name, and the function receives the request body object to modify directly.
   *
   * @example
   * requestBodies: {
   *   CreateUserRequest: (requestBody) => {
   *     requestBody.required = true;
   *   }
   * }
   */
  requestBodies?: Record<
    string,
    (
      requestBody:
        | OpenApiRequestBodyObject.V3_0_X
        | OpenApiRequestBodyObject.V3_1_X,
    ) => void
  >;
  /**
   * Patch OpenAPI responses in place. The key is the response name, and the function receives the response object to modify directly.
   *
   * @example
   * responses: {
   *   NotFound: (response) => {
   *     response.description = 'Resource not found.';
   *   }
   * }
   */
  responses?: Record<
    string,
    (
      response: OpenApiResponseObject.V3_0_X | OpenApiResponseObject.V3_1_X,
    ) => void
  >;
  /**
   * Each function receives the schema object to be modified in place. Common
   * use cases include fixing incorrect data types, removing unwanted
   * properties, adding missing fields, or standardizing date/time formats.
   *
   * @example
   * ```js
   * schemas: {
   *   Foo: (schema) => {
   *     // convert date-time format to timestamp
   *     delete schema.properties.updatedAt.format;
   *     schema.properties.updatedAt.type = 'number';
   *   },
   *   Bar: (schema) => {
   *     // add missing property
   *     schema.properties.metadata = {
   *       additionalProperties: true,
   *       type: 'object',
   *     };
   *     schema.required = ['metadata'];
   *   },
   *   Baz: (schema) => {
   *     // remove property
   *     delete schema.properties.internalField;
   *   }
   * }
   * ```
   */
  schemas?: Record<
    string,
    (
      schema:
        | OpenApiSchemaObject.V2_0_X
        | OpenApiSchemaObject.V3_0_X
        | OpenApiSchemaObject.V3_1_X,
    ) => void
  >;
  /**
   * Patch the OpenAPI version string. The function receives the current version and should return the new version string.
   * Useful for normalizing or overriding the version value before further processing.
   *
   * @param version The current OpenAPI version string.
   * @returns The new version string to use.
   *
   * @example
   * version: (version) => version.replace(/^v/, '')
   */
  version?: MaybeFunc<(version: string) => string>;
};
