import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

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
import { Performance, PerformanceReport } from './utils/performance';

type Configs = UserConfig | (() => UserConfig) | (() => Promise<UserConfig>);

colors.enabled = colorSupport().hasBasic;

/**
 * Generate a client from the provided configuration.
 *
 * @param userConfig User provided {@link UserConfig} configuration.
 */
export const createClient = async (
  userConfig?: Configs,
): Promise<ReadonlyArray<Client | IR.Context>> => {
  const resolvedConfig =
    typeof userConfig === 'function' ? await userConfig() : userConfig;

  const configs: Array<Config> = [];

  try {
    Performance.start('createClient');

    Performance.start('config');
    for (const result of await initConfigs(resolvedConfig)) {
      configs.push(result.config);
      if (result.errors.length) {
        throw result.errors[0];
      }
    }
    Performance.end('config');

    Performance.start('handlebars');
    const templates = registerHandlebarTemplates();
    Performance.end('handlebars');

    const clients = await Promise.all(
      configs.map((config) => pCreateClient({ config, templates })),
    );
    const result = clients.filter((client) => Boolean(client)) as ReadonlyArray<
      Client | IR.Context
    >;

    Performance.end('createClient');

    const config = configs[0];
    if (config && config.logs.level === 'debug') {
      const perfReport = new PerformanceReport({
        totalMark: 'createClient',
      });
      perfReport.report({
        marks: [
          'config',
          'openapi',
          'handlebars',
          'parser',
          'generator',
          'postprocess',
        ],
      });
    }

    return result;
  } catch (error) {
    const config = configs[0] as Config | undefined;
    const dryRun = config ? config.dryRun : resolvedConfig?.dryRun;
    const logs = config?.logs ?? getLogs(resolvedConfig);

    let logPath: string | undefined;

    if (logs.level !== 'silent' && logs.file && !dryRun) {
      logPath = logCrashReport(error, logs.path ?? '');
    }

    if (logs.level !== 'silent') {
      printCrashReport({ error, logPath });
      if (await shouldReportCrash()) {
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

export { compiler } from './compiler';
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
export {
  clientDefaultConfig,
  clientDefaultMeta,
} from './plugins/@hey-api/client-core/config';
export { clientPluginHandler } from './plugins/@hey-api/client-core/plugin';
export type { Client } from './plugins/@hey-api/client-core/types';
export type { ExpressionTransformer } from './plugins/@hey-api/transformers/expressions';
export { definePluginConfig } from './plugins/shared/utils/config';
export type { DefinePlugin, Plugin } from './plugins/types';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
