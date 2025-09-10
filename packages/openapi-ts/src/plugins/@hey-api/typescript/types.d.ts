import type { StringCase, StringName } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';
import type { IApi } from './api';

export type EnumsType = 'javascript' | 'typescript' | 'typescript-const';

export type UserConfig = Plugin.Name<'@hey-api/typescript'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'PascalCase'
   */
  case?: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared types that can be referenced across
   * requests and responses.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default '{{name}}'
   */
  definitions?:
    | StringName
    | {
        /**
         * The casing convention to use for generated definition names.
         *
         * @default 'PascalCase'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated definition names. The name variable
         * is obtained from the schema name.
         *
         * @default '{{name}}'
         */
        name?: StringName;
      };
  /**
   * By default, enums are emitted as types to preserve runtime-free output.
   *
   * However, you may want to generate enums as JavaScript objects or
   * TypeScript enums for runtime usage, interoperability, or integration with
   * other tools.
   *
   * @default false
   */
  enums?:
    | boolean
    | EnumsType
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'SCREAMING_SNAKE_CASE'
         */
        case?: StringCase;
        /**
         * When generating enums as JavaScript objects, they'll contain a null
         * value if they're nullable. This might be undesirable if you want to do
         * `Object.values(Foo)` and have all values be of the same type.
         *
         * This setting is disabled by default to preserve the source schemas.
         *
         * @default false
         */
        constantsIgnoreNull?: boolean;
        /**
         * Whether to generate runtime enums.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Specifies the output mode for generated enums.
         *
         * Can be:
         * - `javascript`: Generates JavaScript objects
         * - `typescript`: Generates TypeScript enums
         * - `typescript-const`: Generates TypeScript const enums
         *
         * @default 'javascript'
         */
        mode?: EnumsType;
      };
  /**
   * Configuration for error-specific types.
   *
   * Controls generation of types for error response bodies and status codes.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default '{{name}}Errors'
   */
  errors?:
    | StringName
    | {
        /**
         * The casing convention to use for generated error type names.
         *
         * @default 'PascalCase'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated error type names. The name
         * variable is obtained from the operation name.
         *
         * @default '{{name}}Error'
         */
        error?: StringName;
        /**
         * Custom naming pattern for generated error type names. The name
         * variable is obtained from the operation name.
         *
         * @default '{{name}}Errors'
         */
        name?: StringName;
      };
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default true
   */
  exportFromIndex?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'types'
   */
  output?: string;
  /**
   * Configuration for request-specific types.
   *
   * Controls generation of types for request bodies, query parameters, path
   * parameters, and headers.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default '{{name}}Data'
   */
  requests?:
    | StringName
    | {
        /**
         * The casing convention to use for generated request type names.
         *
         * @default 'PascalCase'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated request type names. The name
         * variable is obtained from the operation name.
         *
         * @default '{{name}}Data'
         */
        name?: StringName;
      };
  /**
   * Configuration for response-specific types.
   *
   * Controls generation of types for response bodies and status codes.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default '{{name}}Responses'
   */
  responses?:
    | StringName
    | {
        /**
         * The casing convention to use for generated response type names.
         *
         * @default 'PascalCase'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated response type names. The name
         * variable is obtained from the operation name.
         *
         * @default '{{name}}Responses'
         */
        name?: StringName;
        /**
         * Custom naming pattern for generated response type names. The name
         * variable is obtained from the operation name.
         *
         * @default '{{name}}Response'
         */
        response?: StringName;
      };
  /**
   * The top type to use for untyped or unspecified schema values.
   *
   * Can be:
   * - `unknown` (default): safe top type, you must narrow before use
   * - `any`: disables type checking, can be used anywhere
   *
   * @default 'unknown'
   */
  topType?: 'any' | 'unknown';
  /**
   * Configuration for webhook-specific types.
   *
   * Controls generation of types for webhook payloads and webhook requests.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default '{{name}}WebhookRequest'
   */
  webhooks?:
    | StringName
    | {
        /**
         * The casing convention to use for generated webhook type names.
         *
         * @default 'PascalCase'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated webhook type names. The name
         * variable is obtained from the webhook key.
         *
         * @default '{{name}}WebhookRequest'
         */
        name?: StringName;
        /**
         * Custom naming pattern for generated webhook type names. The name
         * variable is obtained from the webhook key.
         *
         * @default '{{name}}WebhookPayload'
         */
        payload?: StringName;
      };

  // DEPRECATED OPTIONS BELOW

  /**
   * **This feature works only with the legacy parser**
   *
   * Include only types matching regular expression.
   *
   * @deprecated
   */
  // eslint-disable-next-line typescript-sort-keys/interface
  include?: string;
  /**
   * **This feature works only with the legacy parser**
   *
   * Use your preferred naming pattern
   *
   * @deprecated
   * @default 'preserve'
   */
  style?: 'PascalCase' | 'preserve';
  /**
   * **This feature works only with the legacy parser**
   *
   * Generate a tree of types containing all operations? It will be named
   * $OpenApiTs.
   *
   * @deprecated
   * @default false
   */
  tree?: boolean;
};

export type Config = Plugin.Name<'@hey-api/typescript'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'PascalCase'
   */
  case: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared types that can be referenced across
   * requests and responses.
   */
  definitions: {
    /**
     * The casing convention to use for generated definition names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated definition names. The name variable
     * is obtained from the schema name.
     *
     * @default '{{name}}'
     */
    name: StringName;
  };
  /**
   * By default, enums are emitted as types to preserve runtime-free output.
   *
   * However, you may want to generate enums as JavaScript objects or
   * TypeScript enums for runtime usage, interoperability, or integration with
   * other tools.
   */
  enums: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'SCREAMING_SNAKE_CASE'
     */
    case: StringCase;
    /**
     * When generating enums as JavaScript objects, they'll contain a null
     * value if they're nullable. This might be undesirable if you want to do
     * `Object.values(Foo)` and have all values be of the same type.
     *
     * This setting is disabled by default to preserve the source schemas.
     *
     * @default false
     */
    constantsIgnoreNull: boolean;
    /**
     * Whether to generate runtime enums.
     *
     * @default false
     */
    enabled: boolean;
    /**
     * Specifies the output mode for generated enums.
     *
     * Can be:
     * - `javascript`: Generates JavaScript objects
     * - `typescript`: Generates TypeScript enums
     * - `typescript-const`: Generates TypeScript const enums
     *
     * @default 'javascript'
     */
    mode: EnumsType;
  };
  /**
   * Configuration for error-specific types.
   *
   * Controls generation of types for error response bodies and status codes.
   *
   * Can be:
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   */
  errors: {
    /**
     * The casing convention to use for generated error type names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated error type names. The name
     * variable is obtained from the operation name.
     *
     * @default '{{name}}Error'
     */
    error: StringName;
    /**
     * Custom naming pattern for generated error type names. The name
     * variable is obtained from the operation name.
     *
     * @default '{{name}}Errors'
     */
    name: StringName;
  };
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default true
   */
  exportFromIndex: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'types'
   */
  output: string;
  /**
   * Configuration for request-specific types.
   *
   * Controls generation of types for request bodies, query parameters, path
   * parameters, and headers.
   */
  requests: {
    /**
     * The casing convention to use for generated request type names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated request type names. The name
     * variable is obtained from the operation name.
     *
     * @default '{{name}}Data'
     */
    name: StringName;
  };
  /**
   * Configuration for response-specific types.
   *
   * Controls generation of types for response bodies and status codes.
   */
  responses: {
    /**
     * The casing convention to use for generated response type names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated response type names. The name
     * variable is obtained from the operation name.
     *
     * @default '{{name}}Responses'
     */
    name: StringName;
    /**
     * Custom naming pattern for generated response type names. The name
     * variable is obtained from the operation name.
     *
     * @default '{{name}}Response'
     */
    response: StringName;
  };
  /**
   * The top type to use for untyped or unspecified schema values.
   *
   * @default 'unknown'
   */
  topType: 'any' | 'unknown';
  /**
   * Configuration for webhook-specific types.
   *
   * Controls generation of types for webhook payloads and webhook requests.
   */
  webhooks: {
    /**
     * The casing convention to use for generated webhook type names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated webhook type names. The name
     * variable is obtained from the webhook key.
     *
     * @default '{{name}}WebhookRequest'
     */
    name: StringName;
    /**
     * Custom naming pattern for generated webhook type names. The name
     * variable is obtained from the webhook key.
     *
     * @default '{{name}}WebhookPayload'
     */
    payload: StringName;
  };

  // DEPRECATED OPTIONS BELOW

  /**
   * **This feature works only with the legacy parser**
   *
   * Include only types matching regular expression.
   *
   * @deprecated
   */
  // eslint-disable-next-line typescript-sort-keys/interface
  include?: string;
  /**
   * **This feature works only with the legacy parser**
   *
   * Use your preferred naming pattern
   *
   * @deprecated
   * @default 'preserve'
   */
  style: 'PascalCase' | 'preserve';
  /**
   * **This feature works only with the legacy parser**
   *
   * Generate a tree of types containing all operations? It will be named
   * $OpenApiTs.
   *
   * @deprecated
   * @default false
   */
  tree: boolean;
};

export interface PluginState {
  usedTypeIDs: Set<string>;
}

export type HeyApiTypeScriptPlugin = DefinePlugin<UserConfig, Config, IApi>;
