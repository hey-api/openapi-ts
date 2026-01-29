import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type UserConfig } from '@hey-api/openapi-ts';

import { getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createZodConfig =
  ({
    openApiVersion,
    outputDir,
    zodVersion,
  }: {
    openApiVersion: string;
    outputDir: string;
    zodVersion: (typeof zodVersions)[number];
  }) =>
  (userConfig: UserConfig) => {
    const input = userConfig.input instanceof Array ? userConfig.input[0]! : userConfig.input;
    const inputPath = path.join(
      getSpecsPath(),
      openApiVersion,
      typeof input === 'string' ? input : (input.path as string),
    );
    return {
      plugins: [
        {
          compatibilityVersion: zodVersion.compatibilityVersion,
          name: 'zod',
        },
      ],
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

export const zodVersions = [
  {
    compatibilityVersion: 3,
    folder: 'v3',
  },
  {
    compatibilityVersion: 4,
    folder: 'v4',
  },
  {
    compatibilityVersion: 'mini',
    folder: 'mini',
  },
] as const;
