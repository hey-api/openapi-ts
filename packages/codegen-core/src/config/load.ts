import type { AnyObject, MaybeArray } from '@hey-api/types';
import { loadConfig } from 'c12';

import type { Logger } from '../logger';
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
  const { config: fileConfig, configFile: loadedConfigFile } = await loadConfig<MaybeArray<T>>({
    configFile,
    name,
  });
  eventC12.timeEnd();

  const fileConfigs = fileConfig instanceof Array ? fileConfig : [fileConfig];
  const mergedConfigs = fileConfigs.map((config) => mergeConfigs<T>(config, userConfig));
  const foundConfig = fileConfigs.some((config) => Object.keys(config).length > 0);

  return { configFile: loadedConfigFile, configs: mergedConfigs, foundConfig };
}
