import type { Logger } from '@hey-api/codegen-core';
import type { AnyObject, MaybeArray } from '@hey-api/types';

import { mergeConfigs } from './merge';

export async function loadConfigFile<T extends AnyObject>({
  configFile,
  logger,
  name,
  userConfig,
}: {
  configFile: string | undefined;
  logger: Logger;
  name: string;
  userConfig: T;
}): Promise<{
  configFile: string | undefined;
  configs: ReadonlyArray<T>;
  foundConfig: boolean;
}> {
  const eventC12 = logger.timeEvent('c12');
  // c12 is ESM-only since v3
  const { loadConfig } = await import('c12');

  const { config: fileConfig, configFile: loadedConfigFile } = await loadConfig<
    MaybeArray<T>
  >({
    configFile,
    name,
  });
  eventC12.timeEnd();

  const fileConfigs = fileConfig instanceof Array ? fileConfig : [fileConfig];
  const mergedConfigs = fileConfigs.map((config) =>
    mergeConfigs<T>(config, userConfig),
  );
  const foundConfig = fileConfigs.some(
    (config) => Object.keys(config).length > 0,
  );

  return { configFile: loadedConfigFile, configs: mergedConfigs, foundConfig };
}
