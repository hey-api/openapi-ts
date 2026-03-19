import type { DefinePlugin, OperationsStrategy, Plugin } from '@hey-api/shared';

import type { PluginValidatorNames } from '../../types';
import type { ContractsConfig, UserContractsConfig } from './contracts/types';

export type UserConfig = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks &
  Plugin.UserExports & {
    /**
     * Define the structure of generated oRPC contracts.
     *
     * String shorthand:
     * - `'byTags'` – one container per operation tag
     * - `'flat'` – standalone functions, no container
     * - `'single'` – all operations in a single container
     * - custom function for full control
     *
     * Use the object form for advanced configuration.
     *
     * @default 'flat'
     */
    contracts?: OperationsStrategy | UserContractsConfig;
    /**
     * Validate input/output schemas.
     *
     * @default true
     */
    validator?:
      | PluginValidatorNames
      | boolean
      | {
          /**
           * The validator plugin to use for input schemas.
           *
           * Can be a validator plugin name or boolean (true to auto-select, false
           * to disable).
           *
           * @default true
           */
          input?: PluginValidatorNames | boolean;
          /**
           * The validator plugin to use for output schemas.
           *
           * Can be a validator plugin name or boolean (true to auto-select, false
           * to disable).
           *
           * @default true
           */
          output?: PluginValidatorNames | boolean;
        };
  };

export type Config = Plugin.Name<'@orpc/contract'> &
  Plugin.Hooks &
  Plugin.Exports & {
    /** Define the structure of generated oRPC contracts. */
    contracts: ContractsConfig;
    /** Validate input/output schemas. */
    validator: {
      /** The validator plugin to use for input schemas. */
      input: PluginValidatorNames | false;
      /** The validator plugin to use for output schemas. */
      output: PluginValidatorNames | false;
    };
  };

export type OrpcContractPlugin = DefinePlugin<UserConfig, Config>;
