/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'node:path';

// @ts-ignore
import { customClientPlugin } from '@hey-api/client-custom/plugin';
import { defineConfig } from '@hey-api/openapi-ts';

// @ts-ignore
import { myClientPlugin } from './custom/client/plugin';

// @ts-ignore
// eslint-disable-next-line arrow-body-style
export default defineConfig(() => {
  // ...
  return {
    // experimentalParser: false,
    input: {
      // branch: 'main',
      // exclude: [
      //   '^#/components/schemas/ModelWithCircularReference$',
      //   '@deprecated',
      // ],
      // fetch: {
      //   headers: {
      //     'x-foo': 'bar',
      //   },
      // },
      // include:
      //   '^(#/components/schemas/import|#/paths/api/v{api-version}/simple/options)$',
      // organization: 'hey-api',
      // path: {
      //   components: {},
      //   info: {
      //     version: '1.0.0',
      //   },
      //   openapi: '3.1.0',
      //   paths: {},
      // },
      path: path.resolve(__dirname, 'spec', '3.1.x', 'full.json'),
      // path: path.resolve(__dirname, 'spec', '3.1.x', 'read-write-only.yaml'),
      // path: 'http://localhost:4000/',
      // path: 'https://get.heyapi.dev/',
      // path: 'https://get.heyapi.dev/hey-api/backend?branch=main&version=1.0.0',
      // path: 'http://localhost:8000/openapi.json',
      // path: './test/spec/v3-transforms.json',
      // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
      // path: 'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
      // project: 'backend',
      // project: 'upload-openapi-spec',
      // version: '1.0.0',
    },
    logs: {
      // level: 'debug',
      path: './logs',
    },
    // name: 'foo',
    output: {
      // case: 'snake_case',
      // format: 'prettier',
      // indexFile: false,
      // lint: 'eslint',
      path: path.resolve(__dirname, 'generated', 'sample'),
    },
    plugins: [
      // customClientPlugin({
      //   bundle: true,
      // }),
      // myClientPlugin({
      //   // bundle: true,
      // }),
      {
        // baseUrl: false,
        // bundle: true,
        // bundleSource_EXPERIMENTAL: true,
        // exportFromIndex: true,
        name: '@hey-api/client-fetch',
        // strictBaseUrl: true,
      },
      {
        // name: '@hey-api/schemas',
        // type: 'json',
      },
      {
        // asClass: true,
        // auth: false,
        // client: false,
        // include...
        // name: '@hey-api/sdk',
        // operationId: false,
        // serviceNameBuilder: '^Parameters',
        // throwOnError: true,
        // transformer: '@hey-api/transformers',
        // transformer: true,
        // validator: 'zod',
      },
      {
        bigInt: true,
        dates: true,
        // name: '@hey-api/transformers',
      },
      {
        // enums: 'typescript',
        // enums: 'typescript+namespace',
        // enums: 'javascript',
        // enumsCase: 'camelCase',
        // exportInlineEnums: true,
        // identifierCase: 'preserve',
        name: '@hey-api/typescript',
        // readOnlyWriteOnlyBehavior: 'off',
        // readableNameBuilder: 'Readable{{name}}',
        // writableNameBuilder: 'Writable{{name}}',
        // tree: true,
      },
      {
        // name: 'fastify',
      },
      {
        name: '@tanstack/react-query',
      },
      {
        // exportFromIndex: true,
        // name: 'zod',
      },
    ],
    // useOptions: false,
    // watch: {
    //   enabled: true,
    //   interval: 1_000,
    //   timeout: 60_000,
    // },
  };
});
