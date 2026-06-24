import path from 'node:path';

import type { UserConfig } from '@hey-api/openapi-ts';

export function createConfigFactory({ outputDir }: { outputDir: string }) {
  return (userConfig: UserConfig) =>
    ({
      ...userConfig,
      logs: {
        level: 'silent',
        path: './logs',
      },
      output:
        typeof userConfig.output === 'string'
          ? path.join(outputDir, userConfig.output)
          : {
              ...userConfig.output,
              path: path.join(
                outputDir,
                userConfig.output instanceof Array ? '' : userConfig.output.path,
              ),
            },
    }) as const satisfies UserConfig;
}

export const getSnapshotsPath = (): string => path.join(import.meta.dirname, '..', '__snapshots__');

export const getTempSnapshotsPath = (): string =>
  path.join(import.meta.dirname, '..', '.gen', 'snapshots');
