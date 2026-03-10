import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type UserConfig } from '@hey-api/openapi-python';

import { getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPydanticConfig =
  ({ openApiVersion, outputDir }: { openApiVersion: string; outputDir: string }) =>
  (userConfig: UserConfig) => {
    const input = userConfig.input instanceof Array ? userConfig.input[0]! : userConfig.input;
    const inputPath = path.join(
      getSpecsPath(),
      openApiVersion,
      typeof input === 'string' ? input : (input.path as string),
    );
    return {
      plugins: ['pydantic'],
      ...userConfig,
      input:
        typeof userConfig.input === 'string'
          ? inputPath
          : {
              ...userConfig.input,
              path: inputPath,
            },
      logs: {
        level: 'silent',
        path: './logs',
      },
      output: path.join(outputDir, typeof userConfig.output === 'string' ? userConfig.output : ''),
    } as const satisfies UserConfig;
  };

export const getSnapshotsPath = (): string => path.join(__dirname, '..', '__snapshots__');

export const getTempSnapshotsPath = (): string => path.join(__dirname, '..', '.gen', 'snapshots');
