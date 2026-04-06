import type { Casing, FeatureToggle, NameTransformer, NamingOptions } from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { IApi } from './api';
import type { NameRulesOverrides } from './shared/types';

export type UserConfig = Plugin.Name<'@faker-js/faker'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    // Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
    /**
     * The compatibility version to target for generated output.
     *
     * Can be:
     * - `9`: [@faker-js/faker v9](https://www.npmjs.com/package/@faker-js/faker/v/9) (default). Requires Node >= 18.
     * - `10`: [@faker-js/faker v10](https://www.npmjs.com/package/@faker-js/faker/v/10). Requires Node ^20.19.0.
     *
     * Both versions produce identical output.
     *
     * @default 9
     */
    compatibilityVersion?: 9 | 10;
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
     * Locale for `@faker-js/faker`. When set, the generated import for the
     * faker instance will use `@faker-js/faker/locale/{locale}` instead of
     * `@faker-js/faker`.
     *
     * @see https://fakerjs.dev/guide/localization
     */
    locale?: string;
    /**
     * Maximum recursion depth for circular schema references.
     * When the call depth exceeds this value, circular references
     * will return empty arrays or be omitted for optional properties.
     *
     * @default 10
     */
    maxCallDepth?: number;
    /**
     * Customize the faker method based on property names.
     */
    nameRules?: {
      /** Name rules for number schema type */
      number?: NameRulesOverrides;
      /** Name rules for string schema type */
      string?: NameRulesOverrides;
    };
    /**
     * Configuration for operation request factories.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     */
    requests?:
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
           * @default 'fake{{name}}Request'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for operation response factories.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     */
    responses?:
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
           * @default 'fake{{name}}Response'
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'@faker-js/faker'> &
  Plugin.Hooks &
  Plugin.Exports & {
    // Resolvers & {
    /** Casing convention for generated names. */
    case: Casing;
    /** The compatibility version to target for generated output. */
    compatibilityVersion: 9 | 10;
    /** Configuration for reusable schema definitions. */
    definitions: NamingOptions & FeatureToggle;
    /** Locale for `@faker-js/faker`. */
    locale?: string;
    /** Maximum recursion depth for circular schema references. */
    maxCallDepth: number;
    /** Faker method customization based on property name */
    nameRules: {
      number?: NameRulesOverrides;
      string?: NameRulesOverrides;
    };
    /** Configuration for operation request factories. */
    requests: NamingOptions & FeatureToggle;
    /** Configuration for operation response factories. */
    responses: NamingOptions & FeatureToggle;
  };

export type FakerJsFakerPlugin = DefinePlugin<UserConfig, Config, IApi>;
