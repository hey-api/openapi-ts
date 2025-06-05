import type {
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from '../openApi/types';

export interface Input {
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Projects are private by default, you will need to be authenticated
   * to download OpenAPI specifications. We recommend using project API
   * keys in CI workflows and personal API keys for local development.
   *
   * API key isn't required for public projects. You can also omit this
   * parameter and provide an environment variable `HEY_API_TOKEN`.
   */
  api_key?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * You can fetch the last build from branch by providing the branch
   * name.
   */
  branch?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * You can fetch an exact specification by providing a commit sha.
   * This will always return the same file.
   */
  commit_sha?: string;
  /**
   * You pass any valid Fetch API options to the request for fetching your
   * specification. This is useful if your file is behind auth for example.
   */
  fetch?: RequestInit;
  /**
   * Filters can be used to select a subset of your input before it's processed
   * by plugins.
   */
  filters?: Filters;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Organization created in Hey API platform.
   */
  organization?: string;
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
   * Path to the OpenAPI specification. This can be either local or remote path.
   * Both JSON and YAML file formats are supported. You can also pass the parsed
   * object directly if you're fetching the file yourself.
   */
  path?:
    | 'https://get.heyapi.dev/<organization>/<project>'
    | (string & {})
    | Record<string, unknown>;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Project created in Hey API platform.
   */
  project?: string;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * If you're tagging your specifications with custom tags, you can use
   * them to filter the results. When you provide multiple tags, only
   * the first match will be returned.
   */
  tags?: ReadonlyArray<string>;
  /**
   * **This is an experimental feature.**
   *
   * Validate the input before generating output? This is an experimental,
   * lightweight feature and support will be added on an ad hoc basis.
   *
   * @default false
   */
  validate_EXPERIMENTAL?: boolean;
  /**
   * **Requires `path` to start with `https://get.heyapi.dev` or be undefined**
   *
   * Every OpenAPI document contains a required version field. You can
   * use this value to fetch the last uploaded specification matching
   * the value.
   */
  version?: string;
  /**
   * Regenerate the client when the input file changes? You can alternatively
   * pass a numeric value for the interval in ms.
   *
   * @default false
   */
  watch?: boolean | number | Watch;
}

export interface Filters {
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
   * Keep reusable components without any references in the output? By
   * default, we exclude orphaned resources.
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
}

export interface Patch {
  parameters?: Record<
    string,
    (
      parameter: OpenApiParameterObject.V3_0_X | OpenApiParameterObject.V3_1_X,
    ) => void
  >;
  requestBodies?: Record<
    string,
    (
      requestBody:
        | OpenApiRequestBodyObject.V3_0_X
        | OpenApiRequestBodyObject.V3_1_X,
    ) => void
  >;
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
}

export interface Watch {
  /**
   * Regenerate the client when the input file changes?
   *
   * @default false
   */
  enabled?: boolean;
  /**
   * How often should we attempt to detect the input file change? (in ms)
   *
   * @default 1000
   */
  interval?: number;
  /**
   * How long will we wait before the request times out?
   *
   * @default 60_000
   */
  timeout?: number;
}
