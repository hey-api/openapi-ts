import type { StringCase } from '../../../types/case';
import type { DefinePlugin, Plugin } from '../../types';

export type EnumsType = 'javascript' | 'typescript' | 'typescript+namespace';

export type Config = Plugin.Name<'@hey-api/typescript'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'PascalCase'
   */
  case?: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
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
         * - `typescript+namespace`: Generates TypeScript enums within a namespace
         *
         * @default 'javascript'
         */
        mode?: EnumsType;
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

export type ResolvedConfig = Plugin.Name<'@hey-api/typescript'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'PascalCase'
   */
  case: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
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
     * - `typescript+namespace`: Generates TypeScript enums within a namespace
     *
     * @default 'javascript'
     */
    mode: EnumsType;
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

export type HeyApiTypeScriptPlugin = DefinePlugin<Config, ResolvedConfig>;
