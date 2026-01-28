import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type UserConfig } from '@hey-api/openapi-ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createSdkConfig =
  ({ outputDir }: { outputDir: string }) =>
  (userConfig: UserConfig) =>
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
                userConfig.output instanceof Array
                  ? ''
                  : userConfig.output.path,
              ),
            },
    }) as const satisfies UserConfig;

export const getSnapshotsPath = (): string =>
  path.join(__dirname, '..', '__snapshots__');

export const getTempSnapshotsPath = (): string =>
  path.join(__dirname, '..', '.gen', 'snapshots');
