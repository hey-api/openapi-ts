import fs from 'node:fs';

import { sync } from 'glob';
import { describe, expect, it } from 'vitest';

import { createClient } from '../';
import type { UserConfig } from '../src/types/config';

const V2_SPEC_PATH = './test/spec/v2.json';
const V3_SPEC_PATH = './test/spec/v3.json';
const V3_TRANSFORMS_SPEC_PATH = './test/spec/v3-transforms.json';

const OUTPUT_PREFIX = './test/generated/';

const toOutputPath = (name: string) => `${OUTPUT_PREFIX}${name}/`;
const toSnapshotPath = (file: string) =>
  `./__snapshots__/${file.replace(OUTPUT_PREFIX, '')}.snap`;

describe('OpenAPI v2', () => {
  it.each([
    {
      config: {
        client: 'legacy/fetch',
        exportCore: true,
        input: '',
        output: '',
        plugins: [
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
    sync(`${output}**/*.ts`).forEach((file) => {
      const content = fs.readFileSync(file, 'utf8').toString();
      expect(content).toMatchFileSnapshot(toSnapshotPath(file));
    });
  });
});

describe('OpenAPI v3', () => {
  const config: UserConfig = {
    client: 'legacy/fetch',
    exportCore: true,
    input: '',
    output: '',
    plugins: [
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
        client: 'legacy/angular',
        plugins: [
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
        client: 'legacy/angular',
        plugins: ['@hey-api/typescript', '@hey-api/sdk'],
      }),
      description: 'generate tree-shakeable angular client',
      name: 'v3_angular_tree_shakeable',
    },
    {
      config: createConfig({
        client: 'legacy/node',
        plugins: [
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
        client: 'legacy/axios',
        plugins: [
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
        client: '@hey-api/client-axios',
      }),
      description: 'generate Axios client',
      name: 'v3-hey-api-client-axios',
    },
    {
      config: createConfig({
        client: {
          bundle: true,
          name: '@hey-api/client-axios',
        },
      }),
      description: 'generate bundled Axios client',
      name: 'v3-hey-api-client-axios-bundle',
    },
    {
      config: createConfig({
        client: '@hey-api/client-axios',
        plugins: [
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
      description: 'generate class-based Axios client',
      name: 'v3-hey-api-client-axios-class',
    },
    {
      config: createConfig({
        client: '@hey-api/client-fetch',
      }),
      description: 'generate Fetch API client',
      name: 'v3-hey-api-client-fetch',
    },
    {
      config: createConfig({
        client: {
          bundle: true,
          name: '@hey-api/client-fetch',
        },
      }),
      description: 'generate bundled Fetch API client',
      name: 'v3-hey-api-client-fetch-bundle',
    },
    {
      config: createConfig({
        client: '@hey-api/client-fetch',
        plugins: [
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
      description: 'generate class-based Fetch API client',
      name: 'v3-hey-api-client-fetch-class',
    },
    {
      config: createConfig({
        client: 'legacy/xhr',
        plugins: [
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
        plugins: [
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
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
          },
          {
            asClass: true,
            include: '^(Simple|Parameters)',
            name: '@hey-api/sdk',
            serviceNameBuilder: 'myAwesome{{name}}Api',
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
          {
            enums: 'javascript',
            name: '@hey-api/typescript',
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
        plugins: ['@hey-api/typescript'],
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
        output,
      });
      sync(`${output}**/*.ts`).forEach((file) => {
        const content = fs.readFileSync(file, 'utf8').toString();
        expect(content).toMatchFileSnapshot(toSnapshotPath(file));
      });
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

      sync(`${output}**/*.ts`).forEach((file) => {
        const content = fs.readFileSync(file, 'utf8').toString();
        expect(content).toMatchFileSnapshot(toSnapshotPath(file));
      });
    },
  );
});
