import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@hey-api/openapi-ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, '..');
const getSpecsPath = () => path.resolve(root, '..', 'specs');

const version = '3.1.x';
const namespace = 'clients';
const clientName = '@hey-api/client-ofetch';
const outputDir = path.join(
  root,
  'test',
  'generated',
  version,
  namespace,
  clientName,
);

const createConfig = (userConfig) => ({
  ...userConfig,
  input: path.join(getSpecsPath(), version, 'full.yaml'),
  logs: { level: 'silent' },
  output:
    typeof userConfig.output === 'string'
      ? path.join(outputDir, userConfig.output)
      : {
          ...userConfig.output,
          path: path.join(outputDir, userConfig.output.path),
        },
});

const scenarios = [
  {
    config: createConfig({ output: 'default', plugins: [clientName] }),
    description: 'default output',
  },
  {
    config: createConfig({
      output: 'sdk-client-optional',
      plugins: [clientName, { client: true, name: '@hey-api/sdk' }],
    }),
    description: 'SDK with optional client option',
  },
  {
    config: createConfig({
      output: 'sdk-client-required',
      plugins: [clientName, { client: false, name: '@hey-api/sdk' }],
    }),
    description: 'SDK with required client option',
  },
  {
    config: createConfig({
      output: 'base-url-false',
      plugins: [{ baseUrl: false, name: clientName }, '@hey-api/typescript'],
    }),
    description: 'client without base URL',
  },
  {
    config: createConfig({
      output: 'base-url-number',
      plugins: [{ baseUrl: 0, name: clientName }, '@hey-api/typescript'],
    }),
    description: 'client with numeric base URL',
  },
  {
    config: createConfig({
      output: 'base-url-string',
      plugins: [
        { baseUrl: 'https://foo.com', name: clientName },
        '@hey-api/typescript',
      ],
    }),
    description: 'client with custom string base URL',
  },
  {
    config: createConfig({
      output: 'base-url-strict',
      plugins: [{ baseUrl: true, name: clientName }, '@hey-api/typescript'],
    }),
    description: 'client with strict base URL',
  },
  {
    config: createConfig({
      output: {
        path: 'tsconfig-nodenext-sdk',
        tsConfigPath: path.join(
          root,
          'test',
          'tsconfig',
          'tsconfig.nodenext.json',
        ),
      },
      plugins: [clientName, '@hey-api/sdk'],
    }),
    description: 'SDK with NodeNext tsconfig',
  },
  {
    config: createConfig({
      output: { clean: false, path: 'clean-false' },
      plugins: [clientName, '@hey-api/sdk'],
    }),
    description: 'avoid appending extension multiple times | twice',
  },
];

async function main() {
  for (const { config, description } of scenarios) {
    console.log('Generating:', description);
    await createClient(config);
    if (description.endsWith('twice')) {
      await createClient(config);
    }
  }
  // Generate SSE for ofetch as well (mirrors 3.1.x.test.ts scenario)
  const sseOut = path.join(root, 'test', 'generated', version, 'sse-ofetch');
  await createClient({
    input: path.join(getSpecsPath(), version, 'opencode.yaml'),
    logs: { level: 'silent' },
    output: sseOut,
    parser: { filters: { operations: { include: ['GET /event'] } } },
    plugins: [clientName, '@hey-api/sdk'],
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
