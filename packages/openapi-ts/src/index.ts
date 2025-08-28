import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import { checkNodeVersion } from './config/engine';
import { initConfigs } from './config/init';
import { getLogs } from './config/logs';
import { createClient as pCreateClient } from './createClient';
import {
  logCrashReport,
  openGitHubIssueWithCrashReport,
  printCrashReport,
  shouldReportCrash,
} from './error';
import type { IR } from './ir/types';
import type { Client } from './types/client';
import type { Config, UserConfig } from './types/config';
import { registerHandlebarTemplates } from './utils/handlebars';
import { Logger } from './utils/logger';

type Configs = UserConfig | (() => UserConfig) | (() => Promise<UserConfig>);

colors.enabled = colorSupport().hasBasic;

/**
 * Generate a client from the provided configuration.
 *
 * @param userConfig User provided {@link UserConfig} configuration.
 */
export const createClient = async (
  userConfig?: Configs,
  logger = new Logger(),
): Promise<ReadonlyArray<Client | IR.Context>> => {
  const resolvedConfig =
    typeof userConfig === 'function' ? await userConfig() : userConfig;

  const configs: Array<Config> = [];

  try {
    checkNodeVersion();

    const eventCreateClient = logger.timeEvent('createClient');

    const eventConfig = logger.timeEvent('config');
    const configResults = await initConfigs(resolvedConfig);
    for (const result of configResults.results) {
      configs.push(result.config);
      if (result.errors.length) {
        throw result.errors[0];
      }
    }
    eventConfig.timeEnd();

    const eventHandlebars = logger.timeEvent('handlebars');
    const templates = registerHandlebarTemplates();
    eventHandlebars.timeEnd();

    const clients = await Promise.all(
      configs.map((config) =>
        pCreateClient({
          config,
          dependencies: configResults.dependencies,
          logger,
          templates,
        }),
      ),
    );
    const result = clients.filter((client) => Boolean(client)) as ReadonlyArray<
      Client | IR.Context
    >;

    eventCreateClient.timeEnd();

    const config = configs[0];
    logger.report(config && config.logs.level === 'debug');

    return result;
  } catch (error) {
    const config = configs[0] as Config | undefined;
    const dryRun = config ? config.dryRun : resolvedConfig?.dryRun;
    const isInteractive = config
      ? config.interactive
      : resolvedConfig?.interactive;
    const logs = config?.logs ?? getLogs(resolvedConfig);

    let logPath: string | undefined;

    if (logs.level !== 'silent' && logs.file && !dryRun) {
      logPath = logCrashReport(error, logs.path ?? '');
    }

    if (logs.level !== 'silent') {
      printCrashReport({ error, logPath });
      if (await shouldReportCrash({ error, isInteractive })) {
        await openGitHubIssueWithCrashReport(error);
      }
    }

    throw error;
  }
};

/**
 * Type helper for openapi-ts.config.ts, returns {@link UserConfig} object
 */
export const defineConfig = async (config: Configs): Promise<UserConfig> =>
  typeof config === 'function' ? await config() : config;

export { defaultPaginationKeywords } from './config/parser';
export { defaultPlugins } from './config/plugins';
export type { IR } from './ir/types';
export type {
  OpenApi,
  OpenApiMetaObject,
  OpenApiOperationObject,
  OpenApiParameterObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
} from './openApi/types';
export type { AngularClient } from './plugins/@hey-api/client-angular';
export type { AxiosClient } from './plugins/@hey-api/client-axios';
export {
  clientDefaultConfig,
  clientDefaultMeta,
} from './plugins/@hey-api/client-core/config';
export { clientPluginHandler } from './plugins/@hey-api/client-core/plugin';
export type { Client } from './plugins/@hey-api/client-core/types';
export type { FetchClient } from './plugins/@hey-api/client-fetch';
export type { NextClient } from './plugins/@hey-api/client-next';
export type { NuxtClient } from './plugins/@hey-api/client-nuxt';
export type { ExpressionTransformer } from './plugins/@hey-api/transformers/expressions';
export type { TypeTransformer } from './plugins/@hey-api/transformers/types';
export { definePluginConfig } from './plugins/shared/utils/config';
export type { DefinePlugin, Plugin } from './plugins/types';
export { compiler, tsc } from './tsc';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
export { Logger } from './utils/logger';
