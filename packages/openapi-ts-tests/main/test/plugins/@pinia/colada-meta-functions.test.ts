import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { describe, expect, it } from 'vitest';

import { getFilePaths, getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';
const outputDir = path.join(__dirname, 'generated', version);

describe('@pinia/colada plugin meta functions', () => {
  const createConfig = (userConfig: UserConfig): UserConfig => {
    const inputPath = path.join(
      getSpecsPath(),
      version,
      typeof userConfig.input === 'string'
        ? userConfig.input
        : (userConfig.input.path as string),
    );
    return {
      plugins: ['@hey-api/typescript'],
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
      },
      output: path.join(
        outputDir,
        typeof userConfig.output === 'string' ? userConfig.output : '',
      ),
    };
  };

  const scenarios = [
    {
      config: createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/queryMetaFunction',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            name: '@pinia/colada',
            queryOptions: {
              meta: (operation) => ({
                httpMethod: operation.method,
                isDeprecated: operation.deprecated || false,
                operationId: operation.id,
                operationPath: operation.path,
                tags: operation.tags,
              }),
            },
          },
        ],
      }),
      description: 'generates Pinia Colada code with query meta function',
    },
    {
      config: createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/mutationMetaFunction',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            mutationOptions: {
              meta: (operation) => ({
                httpMethod: operation.method,
                operationId: operation.id,
                operationPath: operation.path,
                security: operation.security || [],
                tags: operation.tags,
              }),
            },
            name: '@pinia/colada',
          },
        ],
      }),
      description: 'generates Pinia Colada code with mutation meta function',
    },
    {
      config: createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/bothMetaFunctions',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            mutationOptions: {
              meta: (operation) => ({
                id: operation.id,
                method: operation.method,
                type: 'mutation',
              }),
            },
            name: '@pinia/colada',
            queryOptions: {
              meta: (operation) => ({
                id: operation.id,
                method: operation.method,
                type: 'query',
              }),
            },
          },
        ],
      }),
      description:
        'generates Pinia Colada code with both query and mutation meta functions',
    },
    {
      config: createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/metaWithGroupByTag',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            exportFromIndex: true,
            groupByTag: true,
            mutationOptions: {
              meta: (operation) => ({
                operationId: operation.id,
                tag: operation.tags?.[0] || 'default',
              }),
            },
            name: '@pinia/colada',
            queryOptions: {
              meta: (operation) => ({
                operationId: operation.id,
                tag: operation.tags?.[0] || 'default',
              }),
            },
          },
        ],
      }),
      description:
        'generates Pinia Colada code with meta functions and groupByTag',
    },
    {
      config: createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/metaWithCustomConfig',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            autoDetectHttpMethod: false,
            mutationOptions: {
              meta: (operation) => ({
                customField: `mutation_${operation.id}`,
                httpMethod: operation.method,
                shouldBeBoth: operation.id === 'getPetById',
              }),
            },
            name: '@pinia/colada',
            operationTypes: {
              addPet: 'query',
              getPetById: 'both',
            },
            queryOptions: {
              meta: (operation) => ({
                customField: `query_${operation.id}`,
                forced: operation.id === 'addPet',
                httpMethod: operation.method,
              }),
            },
          },
        ],
      }),
      description:
        'generates Pinia Colada code with meta functions and custom configuration',
    },
  ];

  it.each(scenarios)('$description', async ({ config }) => {
    await createClient(config);

    const outputPath =
      typeof config.output === 'string' ? config.output : config.output.path;
    const filePaths = getFilePaths(outputPath);

    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        await expect(fileContent).toMatchFileSnapshot(
          path.join(
            __dirname,
            '__snapshots__',
            version,
            filePath.slice(outputDir.length + 1),
          ),
        );
      }),
    );
  });

  describe('meta function content validation', () => {
    it('should include meta properties in generated query options', async () => {
      const config = createConfig({
        input: 'petstore.yaml',
        output: 'plugins/@pinia/colada/metaValidation',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/sdk',
          {
            name: '@pinia/colada',
            queryOptions: {
              meta: () => ({
                anotherProperty: 42,
                testProperty: 'testValue',
              }),
            },
          },
        ],
      });

      await createClient(config);

      const outputPath =
        typeof config.output === 'string' ? config.output : config.output.path;
      const filePaths = getFilePaths(outputPath);

      // Find the generated Pinia Colada file
      const piniaFile = filePaths.find(
        (filePath) =>
          filePath.includes('@pinia/colada') && filePath.endsWith('.gen.ts'),
      );

      expect(piniaFile).toBeDefined();

      if (piniaFile) {
        const fileContent = fs.readFileSync(piniaFile, 'utf-8');

        // Check that meta properties are included in the generated code
        expect(fileContent).toContain('testProperty');
        expect(fileContent).toContain('testValue');
        expect(fileContent).toContain('anotherProperty');
        expect(fileContent).toContain('42');
      }
    });
  });
});
