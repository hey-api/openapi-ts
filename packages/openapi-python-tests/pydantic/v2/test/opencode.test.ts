import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-python';

import { getFilePaths } from '../../../utils';
import { createPydanticConfig, getSnapshotsPath, getTempSnapshotsPath } from './utils';

const version = '3.1.x';

const outputDir = path.join(getTempSnapshotsPath(), version);
const snapshotsDir = path.join(getSnapshotsPath(), version);

describe(`Pydantic: OpenAPI ${version}`, () => {
  const createConfig = createPydanticConfig({
    openApiVersion: version,
    outputDir,
  });

  const scenarios = [
    {
      config: createConfig({
        input: 'opencode.yaml',
        output: 'opencode',
      }),
      description: 'OpenCode spec',
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
