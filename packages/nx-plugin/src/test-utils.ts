import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { logger, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import type { OpenApiClientGeneratorSchema } from './generators/openapi-client/openapiClient';
import { makeDir } from './utils';

export const TestOptions = {
  client: '@hey-api/client-fetch',
  name: 'test-api',
  scope: '@test-api',
  specFileName: 'test-spec.yaml',
  tags: ['api', 'openapi'],
};

export const getGeneratorOptions = async ({
  name,
  tempDirectory,
}: {
  name: string;
  /**
   * The directory that will be used to create the temp spec file
   */
  tempDirectory: string;
}): Promise<{
  options: OpenApiClientGeneratorSchema;
  specPath: string;
  tree: Tree;
}> => {
  const tree = createTreeWithEmptyWorkspace();

  // Create a mock spec file in the workspace
  const mockSpecContent = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /test:
    get:
      responses:
        '200':
          description: OK
    `;

  // Create temp directory in the workspace root
  const tempDir = `${tempDirectory}/${name}`;
  const apiDir = `${tempDir}/api`;
  if (!existsSync(apiDir)) {
    await makeDir(join(process.cwd(), apiDir));
  }

  // Write the spec file
  const tempSpecPath = `${apiDir}/${TestOptions.specFileName}`;
  const absoluteSpecPath = join(process.cwd(), tempSpecPath);
  logger.debug(`Writing generator spec to ${absoluteSpecPath}`);
  await writeFile(absoluteSpecPath, mockSpecContent);

  const options = {
    client: TestOptions.client,
    directory: tempDir,
    name: TestOptions.name,
    plugins: [],
    scope: TestOptions.scope,
    spec: tempSpecPath,
    tags: TestOptions.tags,
    tempFolderDir: tempDir + '/temp',
  } satisfies OpenApiClientGeneratorSchema;

  // Update options with the correct spec file path
  return {
    options,
    specPath: tempSpecPath,
    tree,
  };
};
