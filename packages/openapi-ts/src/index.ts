// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./overrides.d.ts" />

import colors from 'ansi-colors';
// @ts-expect-error
import colorSupport from 'color-support';

import { checkNodeVersion } from './config/engine';
import type { Configs } from './config/init';
import { initConfigs } from './config/init';
import { getLogs } from './config/logs';
import { createClient as pCreateClient } from './createClient';
import {
  ConfigValidationError,
  JobError,
  logCrashReport,
  openGitHubIssueWithCrashReport,
  printCrashReport,
  shouldReportCrash,
} from './error';
import type { IR } from './ir/types';
import type { Client } from './types/client';
import type { UserConfig } from './types/config';
import type { LazyOrAsync, MaybeArray } from './types/utils';
import { printCliIntro } from './utils/cli';
import { registerHandlebarTemplates } from './utils/handlebars';
import { Logger } from './utils/logger';

colors.enabled = colorSupport().hasBasic;

/**
 * Generate a client from the provided configuration.
 *
 * @param userConfig User provided {@link UserConfig} configuration(s).
 */
export const createClient = async (
  userConfig?: LazyOrAsync<MaybeArray<UserConfig>>,
  logger = new Logger(),
): Promise<ReadonlyArray<Client | IR.Context>> => {
  const resolvedConfig =
    typeof userConfig === 'function' ? await userConfig() : userConfig;
  const userConfigs = resolvedConfig
    ? resolvedConfig instanceof Array
      ? resolvedConfig
      : [resolvedConfig]
    : [];

  let rawLogs = userConfigs.find(
    (config) => getLogs(config).level !== 'silent',
  )?.logs;
  if (typeof rawLogs === 'string') {
    rawLogs = getLogs({ logs: rawLogs });
  }

  let configs: Configs | undefined;

  try {
    checkNodeVersion();

    const eventCreateClient = logger.timeEvent('createClient');

    const eventConfig = logger.timeEvent('config');
    configs = await initConfigs({ logger, userConfigs });
    const printIntro = configs.results.some(
      (result) => result.config.logs.level !== 'silent',
    );
    if (printIntro) {
      printCliIntro();
    }
    eventConfig.timeEnd();

    const allConfigErrors = configs.results.flatMap((result) =>
      result.errors.map((error) => ({ error, jobIndex: result.jobIndex })),
    );
    if (allConfigErrors.length) {
      throw new ConfigValidationError(allConfigErrors);
    }

    const eventHandlebars = logger.timeEvent('handlebars');
    const templates = registerHandlebarTemplates();
    eventHandlebars.timeEnd();

    const clients = await Promise.all(
      configs.results.map(async (result) => {
        try {
          return await pCreateClient({
            config: result.config,
            dependencies: configs!.dependencies,
            jobIndex: result.jobIndex,
            logger,
            templates,
          });
        } catch (error) {
          throw new JobError('', {
            error,
            jobIndex: result.jobIndex,
          });
        }
      }),
    );
    const result = clients.filter((client) => Boolean(client)) as ReadonlyArray<
      Client | IR.Context
    >;

    eventCreateClient.timeEnd();

    const printLogs = configs.results.some(
      (result) => result.config.logs.level === 'debug',
    );
    logger.report(printLogs);

    return result;
  } catch (error) {
    const results = configs?.results ?? [];

    const logs =
      results.find((result) => result.config.logs.level !== 'silent')?.config
        .logs ??
      results[0]?.config.logs ??
      rawLogs;
    const dryRun =
      results.some((result) => result.config.dryRun) ??
      userConfigs.some((config) => config.dryRun) ??
      false;
    const logPath =
      logs?.file && !dryRun
        ? logCrashReport(error, logs.path ?? '')
        : undefined;
    if (!logs || logs.level !== 'silent') {
      printCrashReport({ error, logPath });
      const isInteractive =
        results.some((result) => result.config.interactive) ??
        userConfigs.some((config) => config.interactive) ??
        false;
      if (await shouldReportCrash({ error, isInteractive })) {
        await openGitHubIssueWithCrashReport(error);
      }
    }

    throw error;
  }
};

/**
 * Type helper for openapi-ts.config.ts, returns {@link MaybeArray<UserConfig>} object(s)
 */
export const defineConfig = async <T extends MaybeArray<UserConfig>>(
  config: LazyOrAsync<T>,
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
