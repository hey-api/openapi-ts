import fs from 'node:fs';
import path from 'node:path';

import { createClient, type UserConfig } from '@hey-api/openapi-ts';
import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

const V2_SPEC_PATH = './test/spec/v2.json';
const V3_SPEC_PATH = './test/spec/v3.json';
const V3_TRANSFORMS_SPEC_PATH = './test/spec/v3-transforms.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;
const toSnapshotPath = (file: string) =>
  path.resolve(
    __dirname,
    '__snapshots__',
    `${file.replace(OUTPUT_PREFIX, '')}.snap`,
  );

describe('OpenAPI v2', () => {
  it.each([
    {
      config: {
        exportCore: true,
        input: '',
        logs: {
          level: 'silent',
        },
        output: '',
        plugins: [
          'legacy/fetch',
          '@hey-api/schemas',
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
        ],
        useOptions: true,
      } as UserConfig,
      description: 'generate fetch client',
      name: 'v2',
    },
  ])('$description', async ({ config, name }) => {
    const output = toOutputPath(name);
    await createClient({
      ...config,
      input: V2_SPEC_PATH,
      output,
    });
    await Promise.all(
      sync(`${output}**/*.ts`).map(async (file) => {
        const content = fs.readFileSync(file, 'utf8').toString();
        await expect(content).toMatchFileSnapshot(toSnapshotPath(file));
      }),
    );
  });
});

describe('OpenAPI v3', () => {
  const config: UserConfig = {
    exportCore: true,
    input: '',
    logs: {
      level: 'silent',
    },
    output: {
      path: '',
    },
    plugins: [
      'legacy/fetch',
      '@hey-api/sdk',
      {
        enums: 'javascript',
        name: '@hey-api/typescript',
      },
    ],
    useOptions: true,
  };

  const createConfig = (userConfig?: Partial<UserConfig>): UserConfig => ({
    ...config,
    ...userConfig,
  });

  const clientScenarios = [
    {
      config: createConfig({
        plugins: [
          'legacy/fetch',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate fetch client',
      name: 'v3',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/angular',
          '@hey-api/typescript',
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate angular client',
      name: 'v3_angular',
    },
    {
      config: createConfig({
        plugins: ['legacy/angular', '@hey-api/typescript', '@hey-api/sdk'],
      }),
      description: 'generate tree-shakeable angular client',
      name: 'v3_angular_tree_shakeable',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/node',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate node client',
      name: 'v3_node',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/axios',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate axios client',
      name: 'v3_axios',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/xhr',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate xhr client',
      name: 'v3_xhr',
    },
    {
      config: createConfig({
        name: 'ApiClient',
        plugins: [
          'legacy/fetch',
          '@hey-api/typescript',
          '@hey-api/sdk',
          {
            dates: true,
            name: '@hey-api/transformers',
          },
        ],
      }),
      description: 'generate client',
      name: 'v3_client',
    },
  ];

  const allScenarios = [
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          'legacy/fetch',
          {
            dates: true,
            name: '@hey-api/transformers',
          },
          '@hey-api/typescript',
        ],
      }),
      description: 'generate Date types',
      name: 'v3_date',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/fetch',
          {
            include: '^ModelWithString',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            include: '^Defaults',
            name: '@hey-api/sdk',
          },
          {
            dates: true,
            name: '@hey-api/transformers',
          },
        ],
        useOptions: false,
      }),
      description: 'generate legacy positional arguments',
      name: 'v3_legacy_positional_args',
    },
    {
      config: createConfig({
        output: {
          indexFile: false,
          path: '',
        },
        plugins: [
          '@hey-api/client-fetch',
          {
            name: '@hey-api/typescript',
            readOnlyWriteOnlyBehavior: 'off',
          },
        ],
      }),
      description: 'generate output without index file',
      name: 'v3_no_index',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/fetch',
          {
            include: '^ModelWithString',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            include: '^Defaults',
            name: '@hey-api/sdk',
          },
          {
            dates: true,
            name: '@hey-api/transformers',
          },
        ],
      }),
      description: 'generate optional arguments',
      name: 'v3_options',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/fetch',
          {
            enums: 'typescript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate TypeScript enums',
      name: 'v3_enums_typescript',
    },
    {
      config: createConfig({
        plugins: [
          'legacy/fetch',
          {
            enums: 'typescript+namespace',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate TypeScript enums with namespace',
      name: 'v3_enums_typescript_namespace',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/typescript',
            readOnlyWriteOnlyBehavior: 'off',
            style: 'PascalCase',
          },
        ],
      }),
      description: 'generate PascalCase types',
      name: 'v3-types-PascalCase',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/schemas',
            type: 'form',
          },
        ],
      }),
      description: 'generate form validation schemas',
      name: 'v3-schemas-form',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/schemas',
            type: 'json',
          },
        ],
      }),
      description: 'generate JSON Schemas',
      name: 'v3-schemas-json',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/schemas',
            nameBuilder: (name) => `$${name}`,
            type: 'json',
          },
        ],
      }),
      description: 'generate JSON Schemas with custom names',
      name: 'v3-schemas-name',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          'legacy/fetch',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            classNameBuilder: 'myAwesome{{name}}Api',
            include: '^(Simple|Parameters)',
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate services with custom name',
      name: 'v3_services_name',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          'legacy/fetch',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            filter: '^\\w+ /api/v{api-version}/simple$',
            name: '@hey-api/sdk',
          },
        ],
      }),
      description: 'generate services with specific endpoints',
      name: 'v3_services_filter',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          'legacy/fetch',
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
            readOnlyWriteOnlyBehavior: 'off',
          },
          '@hey-api/sdk',
        ],
      }),
      description: 'generate tree-shakeable services',
      name: 'v3_tree_shakeable',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/typescript',
            readOnlyWriteOnlyBehavior: 'off',
          },
        ],
      }),
      description: 'generate only types with default settings',
      name: 'v3_types',
    },
    {
      config: createConfig({
        exportCore: false,
        plugins: [
          {
            name: '@hey-api/typescript',
            readOnlyWriteOnlyBehavior: 'off',
            tree: false,
          },
        ],
      }),
      description: 'generate only types without tree',
      name: 'v3_types_no_tree',
    },
  ];

  it.each(clientScenarios.concat(allScenarios))(
    '$description',
    async ({ config, name }) => {
      const output = toOutputPath(name);
      await createClient({
        ...config,
        input: V3_SPEC_PATH,
        output: {
          ...(typeof config.output === 'object' ? config.output : {}),
          path: output,
        },
      });
      await Promise.all(
        sync(`${output}**/*.ts`).map(async (file) => {
          const content = fs.readFileSync(file, 'utf8').toString();
          await expect(content).toMatchFileSnapshot(toSnapshotPath(file));
        }),
      );
    },
  );

  it.each(clientScenarios)(
    'transforms $description',
    async ({ config, name }) => {
      const output = toOutputPath(name + '_transform');

      await createClient({
        ...config,
        input: V3_TRANSFORMS_SPEC_PATH,
        output,
        plugins: [
          ...(config.plugins ?? []).map((plugin) => {
            if (typeof plugin === 'string') {
              if (plugin === '@hey-api/sdk') {
                return {
                  // @ts-expect-error
                  ...plugin,
                  name: '@hey-api/sdk',
                  transformer: true,
                };
              }
            } else if (plugin.name === '@hey-api/sdk') {
              return {
                ...plugin,
                name: '@hey-api/sdk',
                transformer: true,
              };
            }

            return plugin;
          }),
          {
            dates: true,
            name: '@hey-api/transformers',
          },
        ],
      });

      await Promise.all(
        sync(`${output}**/*.ts`).map(async (file) => {
          const content = fs.readFileSync(file, 'utf8').toString();
          await expect(content).toMatchFileSnapshot(toSnapshotPath(file));
        }),
      );
    },
  );
});

describe('index', () => {
  it('parses v2 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: './test/spec/v2.json',
        output: './generated/v2/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });

  it('parses v3 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: './test/spec/v3.json',
        output: './generated/v3/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });

  it('parses v3-transforms without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input: './test/spec/v3-transforms.json',
        output: './generated/v3/',
        plugins: [
          '@hey-api/client-fetch',
          '@hey-api/schemas',
          '@hey-api/sdk',
          '@hey-api/typescript',
          {
            dates: true,
            name: '@hey-api/transformers',
          },
        ],
      }),
    ).resolves.not.toThrow();
  });

  it('downloads and parses v2 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input:
          'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts-tests/test/spec/v2.json',
        output: './generated/v2-downloaded/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });

  it('downloads and parses v3 without issues', async () => {
    await expect(
      createClient({
        dryRun: true,
        input:
          'https://raw.githubusercontent.com/hey-api/openapi-ts/main/packages/openapi-ts-tests/test/spec/v3.json',
        output: './generated/v3-downloaded/',
        plugins: ['@hey-api/client-fetch'],
      }),
    ).resolves.not.toThrow();
  });
});
