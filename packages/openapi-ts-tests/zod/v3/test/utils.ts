import path from 'node:path';

import type { UserConfig } from '@hey-api/openapi-ts';

import { getSpecsPath } from '../../../utils';

export function createConfigFactory({
  openApiVersion,
  outputDir,
  zodVersion,
}: {
  openApiVersion: string;
  outputDir: string;
  zodVersion: (typeof zodVersions)[number];
}) {
  return (userConfig: UserConfig) => {
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
}

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
