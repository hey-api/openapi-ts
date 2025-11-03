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
      },
      output: path.join(
        outputDir,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
    }) as const satisfies UserConfig;

export const getSnapshotsPath = (): string =>
  path.join(__dirname, '..', '__snapshots__');

export const getTempSnapshotsPath = (): string =>
  path.join(__dirname, '..', '.gen', 'snapshots');
