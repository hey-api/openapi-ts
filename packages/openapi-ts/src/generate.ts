import { Logger } from '@hey-api/codegen-core';
import type { LazyOrAsync, MaybeArray } from '@hey-api/types';

import { checkNodeVersion } from '~/config/engine';
import type { Configs } from '~/config/init';
import { initConfigs } from '~/config/init';
import { getLogs } from '~/config/logs';
import type { UserConfig } from '~/config/types';
import { createClient as pCreateClient } from '~/createClient';
import {
  ConfigValidationError,
  JobError,
  logCrashReport,
  openGitHubIssueWithCrashReport,
  printCrashReport,
  shouldReportCrash,
} from '~/error';
import type { Context } from '~/ir/context';
import { printCliIntro } from '~/utils/cli';

/**
 * Generate a client from the provided configuration.
 *
 * @param userConfig User provided {@link UserConfig} configuration(s).
 */
export const createClient = async (
  userConfig?: LazyOrAsync<MaybeArray<UserConfig>>,
  logger = new Logger(),
): Promise<ReadonlyArray<Context>> => {
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

    const clients = await Promise.all(
      configs.results.map(async (result) => {
        try {
          return await pCreateClient({
            config: result.config,
            dependencies: configs!.dependencies,
            jobIndex: result.jobIndex,
            logger,
          });
        } catch (error) {
          throw new JobError('', {
            error,
            jobIndex: result.jobIndex,
          });
        }
      }),
    );
    const result = clients.filter((client) =>
      Boolean(client),
    ) as ReadonlyArray<Context>;

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
