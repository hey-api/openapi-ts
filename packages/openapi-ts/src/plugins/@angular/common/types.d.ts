import type { OperationsStrategy } from '~/openApi/shared/locations';
import type { DefinePlugin, Plugin } from '~/plugins';

import type {
  HttpRequestsConfig,
  UserHttpRequestsConfig,
} from './httpRequests';
import type {
  HttpResourcesConfig,
  UserHttpResourcesConfig,
} from './httpResources';

export type UserConfig = Plugin.Name<'@angular/common'> &
  Plugin.Hooks & {
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Options for generating HTTP Request instances.
     *
     * @default 'flat'
     */
    httpRequests?: boolean | OperationsStrategy | UserHttpRequestsConfig;
    /**
     * Options for generating HTTP resource APIs.
     *
     * @default 'flat'
     */
    httpResources?: boolean | OperationsStrategy | UserHttpResourcesConfig;
  };

export type Config = Plugin.Name<'@angular/common'> &
  Plugin.Hooks & {
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex: boolean;
    /**
     * Options for generating HTTP Request instances.
     */
    httpRequests: HttpRequestsConfig;
    /**
     * Options for generating HTTP resource APIs.
     */
    httpResources: HttpResourcesConfig;
  };

export type AngularCommonPlugin = DefinePlugin<UserConfig, Config>;
