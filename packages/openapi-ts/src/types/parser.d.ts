import type { FeatureToggle, NamingOptions } from '~/config/shared';
import type {
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from '~/openApi/types';
import type { Hooks } from '~/parser/types/hooks';
import type { Casing, NameTransformer } from '~/utils/naming';

type EnumsMode = 'inline' | 'root';

export type UserParser = {
  /**
   * Filters can be used to select a subset of your input before it's passed
   * to plugins.
   */
  filters?: Filters;
  /**
   * Optional hooks to override default plugin behavior.
   *
   * Use these to classify resources, control which outputs are generated,
   * or provide custom behavior for specific resources.
   */
  hooks?: Hooks;
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
   * Custom input transformations to execute before parsing. Use this
   * to modify, fix, or enhance input before it's passed to plugins.
   */
  patch?: Patch;
  /**
   * Built-in transformations that modify or normalize the input before it's
   * passed to plugins. These options enable predictable, documented behaviors
   * and are distinct from custom patches. Use this to perform structural
   * changes to input in a standardized way.
   */
  transforms?: {
    /**
     * Your input might contain two types of enums:
     * - enums defined as reusable components (root enums)
     * - non-reusable enums nested within other schemas (inline enums)
     *
     * You may want all enums to be reusable. This is because only root enums
     * are typically exported by plugins. Inline enums will never be directly
     * importable since they're nested inside other schemas.
     *
     * For example, to export nested enum types with the `@hey-api/typescript`
     * plugin, set `enums` to `root`. Likewise, if you don't want to export any
     * enum types, set `enums` to `inline`.
     *
     * @default false
     */
    enums?:
      | boolean
      | EnumsMode
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Controls whether enums are promoted to reusable root components
           * ('root') or kept inline within schemas ('inline').
           *
           * @default 'root'
           */
          mode?: EnumsMode;
          /**
           * Customize the generated name of enums.
           *
           * @default '{{name}}Enum'
           */
          name?: NameTransformer;
        };
    /**
     * By default, any object schema with a missing `required` keyword is
     * interpreted as "no properties are required." This is the correct
     * behavior according to the OpenAPI standard. However, some specifications
     * interpret a missing `required` keyword as "all properties should be
     * required."
     *
     * This option allows you to change the default behavior so that
     * properties are required by default unless explicitly marked as optional.
     *
     * @default false
     */
    propertiesRequiredByDefault?: boolean;
    /**
     * Your schemas might contain read-only or write-only fields. Using such
     * schemas directly could mean asking the user to provide a read-only
     * field in requests, or expecting a write-only field in responses.
     *
     * We separate schemas for requests and responses if direct usage
     * would result in such scenarios. You can still disable this
     * behavior if you prefer.
     *
     * @default true
     */
    readWrite?:
      | boolean
      | {
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Configuration for generated request-specific schemas.
           *
           * Can be:
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default '{{name}}Writable'
           */
          requests?:
            | NameTransformer
            | {
                /**
                 * Casing convention for generated names.
                 *
                 * @default 'preserve'
                 */
                case?: Casing;
                /**
                 * Customize the generated name of schemas used in requests or
                 * containing write-only fields.
                 *
                 * @default '{{name}}Writable'
                 */
                name?: NameTransformer;
              };
          /**
           * Configuration for generated response-specific schemas.
           *
           * Can be:
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default '{{name}}'
           */
          responses?:
            | NameTransformer
            | {
                /**
                 * Casing convention for generated names.
                 *
                 * @default 'preserve'
                 */
                case?: Casing;
                /**
                 * Customize the generated name of schemas used in responses or
                 * containing read-only fields. We default to the original name
                 * to avoid breaking output when a read-only field is added.
                 *
                 * @default '{{name}}'
                 */
                name?: NameTransformer;
              };
        };
  };
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

export type Parser = {
  /**
   * Filters can be used to select a subset of your input before it's passed
   * to plugins.
   */
  filters?: Filters;
  /**
   * Optional hooks to override default plugin behavior.
   *
   * Use these to classify resources, control which outputs are generated,
   * or provide custom behavior for specific resources.
   */
  hooks: Hooks;
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
   * Custom input transformations to execute before parsing. Use this
   * to modify, fix, or enhance input before it's passed to plugins.
   */
  patch?: Patch;
  /**
   * Built-in transformations that modify or normalize the input before it's
   * passed to plugins. These options enable predictable, documented behaviors
   * and are distinct from custom patches. Use this to perform structural
   * changes to input in a standardized way.
   */
  transforms: {
    /**
     * Your input might contain two types of enums:
     * - enums defined as reusable components (root enums)
     * - non-reusable enums nested within other schemas (inline enums)
     *
     * You may want all enums to be reusable. This is because only root enums
     * are typically exported by plugins. Inline enums will never be directly
     * importable since they're nested inside other schemas.
     *
     * For example, to export nested enum types with the `@hey-api/typescript`
     * plugin, set `enums` to `root`. Likewise, if you don't want to export any
     * enum types, set `enums` to `inline`.
     */
    enums: NamingOptions &
      FeatureToggle & {
        /**
         * Controls whether enums are promoted to reusable root components
         * ('root') or kept inline within schemas ('inline').
         *
         * @default 'root'
         */
        mode: EnumsMode;
      };
    /**
     * By default, any object schema with a missing `required` keyword is
     * interpreted as "no properties are required." This is the correct
     * behavior according to the OpenAPI standard. However, some specifications
     * interpret a missing `required` keyword as "all properties should be
     * required."
     *
     * This option allows you to change the default behavior so that
     * properties are required by default unless explicitly marked as optional.
     *
     * @default false
     */
    propertiesRequiredByDefault: boolean;
    /**
     * Your schemas might contain read-only or write-only fields. Using such
     * schemas directly could mean asking the user to provide a read-only
     * field in requests, or expecting a write-only field in responses.
     *
     * We separate schemas for requests and responses if direct usage
     * would result in such scenarios. You can still disable this
     * behavior if you prefer.
     */
    readWrite: FeatureToggle & {
      /**
       * Configuration for generated request-specific schemas.
       */
      requests: NamingOptions;
      /**
       * Configuration for generated response-specific schemas.
       */
      responses: NamingOptions;
    };
  };
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
