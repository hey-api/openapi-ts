import type { DefinePlugin, Plugin } from '../../types';
import type { Client } from '../client-core/types';
import type { IApi } from './api';

export type UserConfig = Plugin.Name<'@hey-api/client-nestjs'> &
  Client.Config & {
    /**
     * Custom client class name
     * @default `${clientName}Client`
     */
    clientClassName?: string;

    /**
     * Unique client identifier to avoid symbol conflicts when multiple
     * OpenAPI clients are used in the same NestJS application.
     * This will be used as a prefix for all generated classes, services,
     * modules, and injection tokens.
     * @default 'Api'
     */
    clientName?: string;

    /**
     * Custom module name
     * @default `${clientName}Module`
     */
    moduleName?: string;

    /**
     * Custom service naming strategy
     * @default (tag, clientName) => `${clientName}${PascalCase(tag)}Service`
     */
    serviceNameBuilder?: (tag: string, clientName: string) => string;

    /**
     * Throw an error instead of returning it in the response?
     *
     * @default false
     */
    throwOnError?: boolean;
  };

export type HeyApiClientNestjsPlugin = DefinePlugin<
  UserConfig,
  UserConfig,
  IApi
>;
