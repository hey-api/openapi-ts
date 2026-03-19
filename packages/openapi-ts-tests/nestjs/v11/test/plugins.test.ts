import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';

import { getFilePaths, getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versions = ['2.0.x', '3.0.x', '3.1.x'];

for (const version of versions) {
  const outputDir = path.join(__dirname, '..', '.gen', 'snapshots', version);
  const snapshotsDir = path.join(__dirname, '..', '__snapshots__', version);

  describe(`OpenAPI ${version} nestjs`, () => {
    const createConfig = (
      userConfig: Omit<UserConfig, 'input'> &
        Pick<Required<UserConfig>, 'plugins'> &
        Pick<Partial<UserConfig>, 'input'>,
    ) =>
      ({
        ...userConfig,
        input: path.join(
          getSpecsPath(),
          version,
          typeof userConfig.input === 'string' ? userConfig.input : 'full.yaml',
        ),
        logs: {
          level: 'silent',
        },
        output: path.join(
          outputDir,
          typeof userConfig.output === 'string' ? userConfig.output : '',
        ),
        plugins: userConfig.plugins ?? ['@hey-api/client-fetch'],
      }) as const satisfies UserConfig;

    const scenarios = [
      {
        config: createConfig({
          output: 'default',
          plugins: ['nestjs'],
        }),
        description: 'generate NestJS types with NestJS plugin',
      },
    ];

    it.each(scenarios)('$description', async ({ config }) => {
      await createClient(config);

      const filePaths = getFilePaths(config.output);

      await Promise.all(
        filePaths.map(async (filePath) => {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          await expect(fileContent).toMatchFileSnapshot(
            path.join(snapshotsDir, filePath.slice(outputDir.length + 1)),
          );
        }),
      );
    });
  });
}
