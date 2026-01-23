import type {
  Casing,
  FeatureToggle,
  IndexExportOption,
  NameTransformer,
  NamingOptions,
} from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@faker-js/faker'> &
  Plugin.Hooks & {
    // Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
    /**
     * Configuration for reusable schema definitions.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     */
    definitions?:
      | boolean
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * @default 'fake{{name}}'
           */
          name?: NameTransformer;
        };
    /**
     * Whether exports should be re-exported in the index file.
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Faker locale for generated data.
     *
     * @default 'en'
     */
    locale?: string;
    /**
     * Seed for deterministic output. When set, Faker will produce
     * the same values across runs.
     */
    seed?: number;
  };

export type Config = Plugin.Name<'@faker-js/faker'> &
  Plugin.Hooks &
  IndexExportOption & {
    // Resolvers & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
    /**
     * Configuration for reusable schema definitions.
     */
    definitions: NamingOptions & FeatureToggle;
    /**
     * Faker locale for generated data.
     */
    locale: string;
    /**
     * Seed for deterministic output. When set, Faker will produce
     * the same values across runs.
     */
    seed?: number;
  };

export type FakerJsFakerPlugin = DefinePlugin<UserConfig, Config, IApi>;
