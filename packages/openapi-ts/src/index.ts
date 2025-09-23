import './overrides.d.ts';

import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import { checkNodeVersion } from './config/engine';
import { initConfigs } from './config/init';
import { createClient as pCreateClient } from './createClient';
import {
  logCrashReport,
  openGitHubIssueWithCrashReport,
  printCrashReport,
  shouldReportCrash,
} from './error';
import type { IR } from './ir/types';
import type { Client } from './types/client';
import type { Config, UserConfigMultiOutputs } from './types/config';
import { registerHandlebarTemplates } from './utils/handlebars';
import { Logger } from './utils/logger';

type ConfigValue =
  | UserConfigMultiOutputs
  | ReadonlyArray<UserConfigMultiOutputs>;
// Generic input shape for config that may be a value or a (possibly async) factory
type ConfigInput<T extends ConfigValue> = T | (() => T) | (() => Promise<T>);

colors.enabled = colorSupport().hasBasic;

/**
 * Generate a client from the provided configuration.
 *
 * @param userConfig User provided {@link UserConfigMultiOutputs} configuration.
 */
export const createClient = async (
  userConfig?: ConfigInput<ConfigValue>,
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

    // Check for configuration errors and fail immediately
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
    // Handle both configuration errors and runtime errors
    // For multi-config scenarios, use first available config or reasonable defaults
    const firstConfig = configs[0];
    const resolvedSingle = (
      Array.isArray(resolvedConfig) ? resolvedConfig[0] : resolvedConfig
    ) as UserConfigMultiOutputs | undefined;

    const logs = firstConfig?.logs ?? {
      file: false,
      level: 'warn' as const,
      path: '',
    };
    const dryRun = firstConfig?.dryRun ?? resolvedSingle?.dryRun ?? false;
    const isInteractive =
      firstConfig?.interactive ?? resolvedSingle?.interactive ?? false;

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
 * Type helper for openapi-ts.config.ts, returns {@link ConfigValue} object
 */
export const defineConfig = async <T extends ConfigValue>(
  config: ConfigInput<T>,
): Promise<T> => (typeof config === 'function' ? await config() : config);

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
export type { OfetchClient } from './plugins/@hey-api/client-ofetch';
export type { ExpressionTransformer } from './plugins/@hey-api/transformers/expressions';
export type { TypeTransformer } from './plugins/@hey-api/transformers/types';
export { definePluginConfig } from './plugins/shared/utils/config';
export type { DefinePlugin, Plugin } from './plugins/types';
export { compiler, tsc } from './tsc';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
export { Logger } from './utils/logger';
