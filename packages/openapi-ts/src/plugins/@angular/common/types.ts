import type { DefinePlugin, OperationsStrategy, Plugin } from '@hey-api/shared';

import type { HttpRequestsConfig, UserHttpRequestsConfig } from './httpRequests';
import type { HttpResourcesConfig, UserHttpResourcesConfig } from './httpResources';

export type UserConfig = Plugin.Name<'@angular/common'> &
  Plugin.Hooks &
  Plugin.UserExports & {
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
  Plugin.Hooks &
  Plugin.Exports & {
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
