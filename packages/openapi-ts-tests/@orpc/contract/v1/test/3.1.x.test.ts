import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import { getFilePaths } from '../../../../utils';
import { snapshotsDir, tmpDir } from './constants';
import { createOrpcContractConfig } from './utils';

const version = '3.1.x';

const outputDir = path.join(tmpDir, version);

describe(`OpenAPI ${version}`, () => {
  const createConfig = createOrpcContractConfig({ openApiVersion: version, outputDir });

  const scenarios = [
    {
      config: createConfig({
        input: 'orpc-contract.yaml',
        output: 'default',
      }),
      description: 'generate oRPC contracts with Zod schemas',
    },
    {
      config: createConfig({
        input: 'orpc-contract.yaml',
        output: 'custom-contract-name',
        plugins: [
          'zod',
          {
            contractNameBuilder: (id: string) => `${id}Rpc`,
            name: '@orpc/contract',
          },
        ],
      }),
      description: 'generate oRPC contracts with custom contract name builder',
    },
    {
      config: createConfig({
        input: 'orpc-contract.yaml',
        output: 'custom-router-name',
        plugins: [
          'zod',
          {
            name: '@orpc/contract',
            routerName: 'contract',
          },
        ],
      }),
      description: 'generate oRPC contracts with custom router name',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const filePaths = getFilePaths(config.output as string);

    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        await expect(fileContent).toMatchFileSnapshot(
          path.join(snapshotsDir, version, filePath.slice(outputDir.length + 1)),
        );
      }),
    );
  });
});
