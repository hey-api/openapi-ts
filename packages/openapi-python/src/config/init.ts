import type { Logger } from '@hey-api/codegen-core';
import { loadConfigFile } from '@hey-api/codegen-core';

import { expandToJobs } from './expand';
// import { getProjectDependencies } from './packages';
import type { ResolvedJob } from './resolve';
import { resolveConfig } from './resolve';
import type { UserConfig } from './types';
import { validateJobs } from './validate';

export type Configs = {
  dependencies: Record<string, string>;
  jobs: ReadonlyArray<ResolvedJob>;
};

/**
 * @internal
 */
export async function resolveJobs({
  logger,
  userConfigs,
}: {
  logger: Logger;
  userConfigs: ReadonlyArray<UserConfig>;
}): Promise<Configs> {
  const configs: Array<UserConfig> = [];
  const dependencies: Record<string, string> = {};
  // let dependencies: Record<string, string> = {};

  const eventLoad = logger.timeEvent('load');
  for (const userConfig of userConfigs) {
    let configFile: string | undefined;
    if (userConfig.configFile) {
      const parts = userConfig.configFile.split('.');
      configFile = parts.slice(0, parts.length - 1).join('.');
    }

    const loaded = await loadConfigFile<UserConfig>({
      configFile,
      logger,
      name: 'openapi-python',
      userConfig,
    });

    if (!Object.keys(dependencies).length) {
      // TODO: handle dependencies for multiple configs properly?
      // TODO: collect Python dependencies
      // dependencies = getProjectDependencies(
      //   loaded.foundConfig ? loaded.configFile : undefined,
      // );
    }

    configs.push(...loaded.configs);
  }
  eventLoad.timeEnd();

  const eventBuild = logger.timeEvent('build');
  const jobs = validateJobs(expandToJobs(configs));
  const resolvedJobs = jobs.map((validated) => resolveConfig(validated, dependencies));
  eventBuild.timeEnd();

  return {
    dependencies,
    jobs: resolvedJobs,
  };
}
