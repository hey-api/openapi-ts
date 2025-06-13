import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import { createClient as pCreateClient } from './createClient';
import {
  logCrashReport,
  openGitHubIssueWithCrashReport,
  printCrashReport,
  shouldReportCrash,
} from './error';
import { getLogs } from './getLogs';
import { initConfigs } from './initConfigs';
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

  let configs: Config[] = [];

  try {
    Performance.start('createClient');

    Performance.start('config');
    configs = await initConfigs(resolvedConfig);
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

export { defaultPlugins } from './initConfigs';
export { defaultPaginationKeywords } from './ir/pagination';
export type { IR } from './ir/types';
export type { OpenApi, OpenApiSchemaObject } from './openApi/types';
export { clientDefaultConfig } from './plugins/@hey-api/client-core/config';
export { clientPluginHandler } from './plugins/@hey-api/client-core/plugin';
export type { Client } from './plugins/@hey-api/client-core/types';
export type { Plugin } from './plugins/types';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
