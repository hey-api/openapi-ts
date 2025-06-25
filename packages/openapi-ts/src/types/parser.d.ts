import type {
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from '../openApi/types';

export type Parser = {
  /**
   * Filters can be used to select a subset of your input before it's processed
   * by plugins.
   */
  filters?: Filters;
  /**
   * Pagination configuration.
   */
  pagination?: {
    /**
     * Array of keywords to be considered as pagination field names.
     * These will be used to detect pagination fields in schemas and parameters.
     *
     * @default ['after', 'before', 'cursor', 'offset', 'page', 'start']
     */
    keywords?: ReadonlyArray<string>;
  };
  /**
   * Custom input transformations to execute before parsing. This allows you
   * to modify, fix, or enhance input definitions before code generation.
   */
  patch?: Patch;
  /**
   * **This is an experimental feature.**
   *
   * Validate the input before generating output? This is an experimental,
   * lightweight feature and support will be added on an ad hoc basis. Setting
   * `validate_EXPERIMENTAL` to `true` is the same as `warn`.
   *
   * @default false
   */
  validate_EXPERIMENTAL?: boolean | 'strict' | 'warn';
};

export type ResolvedParser = {
  /**
   * Filters can be used to select a subset of your input before it's processed
   * by plugins.
   */
  filters?: Filters;
  /**
   * Pagination configuration.
   */
  pagination: {
    /**
     * Array of keywords to be considered as pagination field names.
     * These will be used to detect pagination fields in schemas and parameters.
     *
     * @default ['after', 'before', 'cursor', 'offset', 'page', 'start']
     */
    keywords: ReadonlyArray<string>;
  };
  /**
   * Custom input transformations to execute before parsing. This allows you
   * to modify, fix, or enhance input definitions before code generation.
   */
  patch?: Patch;
  /**
   * **This is an experimental feature.**
   *
   * Validate the input before generating output? This is an experimental,
   * lightweight feature and support will be added on an ad hoc basis. Setting
   * `validate_EXPERIMENTAL` to `true` is the same as `warn`.
   *
   * @default false
   */
  validate_EXPERIMENTAL: false | 'strict' | 'warn';
};

export type Filters = {
  /**
   * Include deprecated resources in the output?
   *
   * @default true
   */
  deprecated?: boolean;
  operations?: {
    /**
     * Prevent operations matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['GET /api/v1/foo']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only operations matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['GET /api/v1/foo']
     */
    include?: ReadonlyArray<string>;
  };
  /**
   * Keep reusable components without any references from operations in the
   * output? By default, we exclude orphaned resources.
   *
   * @default false
   */
  orphans?: boolean;
  parameters?: {
    /**
     * Prevent parameters matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['QueryParam']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only parameters matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['QueryParam']
     */
    include?: ReadonlyArray<string>;
  };
  /**
   * Should we preserve the key order when overwriting your input? This
   * option is disabled by default to improve performance.
   *
   * @default false
   */
  preserveOrder?: boolean;
  requestBodies?: {
    /**
     * Prevent request bodies matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only request bodies matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    include?: ReadonlyArray<string>;
  };
  responses?: {
    /**
     * Prevent responses matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only responses matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    include?: ReadonlyArray<string>;
  };
  schemas?: {
    /**
     * Prevent schemas matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only schemas matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['Foo']
     */
    include?: ReadonlyArray<string>;
  };
  tags?: {
    /**
     * Prevent tags matching the `exclude` filters from being processed.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['foo']
     */
    exclude?: ReadonlyArray<string>;
    /**
     * Process only tags matching the `include` filters.
     *
     * In case of conflicts, `exclude` takes precedence over `include`.
     *
     * @example ['foo']
     */
    include?: ReadonlyArray<string>;
  };
};

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
  version?: string | ((version: string) => string);
};
