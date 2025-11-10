import type { DefinePlugin, Plugin } from '~/plugins';
import type { StringCase, StringName } from '~/types/case';

export type UserConfig = Plugin.Name<'swr'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case?: StringCase;
    /**
     * Add comments from SDK functions to the generated SWR code?
     *
     * @default true
     */
    comments?: boolean;
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Configuration for generated useSWRInfinite options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrInfiniteOptions?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate useSWRInfinite options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Whether to export generated symbols.
           *
           * @default true
           */
          exported?: boolean;
          /**
           * Custom naming pattern for generated useSWRInfinite options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Infinite'
           */
          name?: StringName;
        };
    /**
     * Configuration for generated SWR keys.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrKeys?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate SWR keys.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated SWR key names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Key'
           */
          name?: StringName;
        };
    /**
     * Configuration for generated useSWRMutation options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrMutationOptions?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate useSWRMutation options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Whether to export generated symbols.
           *
           * @default true
           */
          exported?: boolean;
          /**
           * Custom naming pattern for generated useSWRMutation options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Mutation'
           */
          name?: StringName;
        };
    /**
     * Configuration for generated useSWR options helpers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    swrOptions?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'camelCase'
           */
          case?: StringCase;
          /**
           * Whether to generate useSWR options helpers.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Whether to export generated symbols.
           *
           * @default true
           */
          exported?: boolean;
          /**
           * Custom naming pattern for generated useSWR options names. The name variable is
           * obtained from the SDK function name.
           *
           * @default '{{name}}Options'
           */
          name?: StringName;
        };
  };

export type Config = Plugin.Name<'swr'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Add comments from SDK functions to the generated SWR code?
     *
     * @default true
     */
    comments: boolean;
    /**
     * Should the exports from the generated files be re-exported in the index barrel file?
     *
     * @default false
     */
    exportFromIndex: boolean;
    /**
     * Resolved configuration for generated useSWRInfinite options helpers.
     */
    swrInfiniteOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate useSWRInfinite options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Whether to export generated symbols.
       *
       * @default true
       */
      exported: boolean;
      /**
       * Custom naming pattern for generated useSWRInfinite options names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Infinite'
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated SWR keys.
     */
    swrKeys: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate SWR keys.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated SWR key names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Key'
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated useSWRMutation options helpers.
     */
    swrMutationOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate useSWRMutation options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Whether to export generated symbols.
       *
       * @default true
       */
      exported: boolean;
      /**
       * Custom naming pattern for generated useSWRMutation options names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Mutation'
       */
      name: StringName;
    };
    /**
     * Resolved configuration for generated useSWR options helpers.
     */
    swrOptions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate useSWR options helpers.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Whether to export generated symbols.
       *
       * @default true
       */
      exported: boolean;
      /**
       * Custom naming pattern for generated useSWR options names. The name variable is obtained from the SDK function name.
       *
       * @default '{{name}}Options'
       */
      name: StringName;
    };
  };

export type SwrPlugin = DefinePlugin<UserConfig, Config>;

export type PluginHandler = SwrPlugin['Handler'];
export type PluginInstance = Plugin.Instance<Config>;
