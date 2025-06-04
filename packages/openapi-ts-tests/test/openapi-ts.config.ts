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
      // fetch: {
      //   headers: {
      //     'x-foo': 'bar',
      //   },
      // },
      filters: {
        // deprecated: false,
        operations: {
          include: [
            // 'PUT /foo',
            // '/^[A-Z]+ /v1//',
          ],
        },
        // orphans: false,
        // preserveOrder: true,
        // tags: {
        //   exclude: ['bar'],
        // },
      },
      // organization: 'hey-api',
      // path: {
      //   components: {},
      //   info: {
      //     version: '1.0.0',
      //   },
      //   openapi: '3.1.0',
      //   paths: {},
      // },
      // path: path.resolve(
      //   __dirname,
      //   'spec',
      //   '3.1.x',
      //   'invalid',
      //   'servers-entry.yaml',
      // ),
      path: path.resolve(__dirname, 'spec', '3.1.x', 'full.json'),
      // path: 'http://localhost:4000/',
      // path: 'https://get.heyapi.dev/',
      // path: 'https://get.heyapi.dev/hey-api/backend?branch=main&version=1.0.0',
      // path: 'http://localhost:8000/openapi.json',
      // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
      // path: 'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
      // project: 'backend',
      // project: 'upload-openapi-spec',
      validate_EXPERIMENTAL: true,
      // version: '1.0.0',
      // watch: 5_000,
      // watch: {
      //   enabled: true,
      //   interval: 500,
      //   timeout: 30_000,
      // },
    },
    logs: {
      // level: 'silent',
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
        name: '@hey-api/client-axios',
        // name: '@hey-api/client-fetch',
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
        name: '@hey-api/sdk',
        // operationId: false,
        responseStyle: 'data',
        // serviceNameBuilder: '{{name}}',
        // throwOnError: true,
        // transformer: '@hey-api/transformers',
        // transformer: true,
        validator: 'zod',
      },
      {
        // bigInt: true,
        dates: true,
        // name: '@hey-api/transformers',
      },
      {
        enums: 'typescript',
        enumsCase: 'PascalCase',
        // enumsConstantsIgnoreNull: true,
        // exportInlineEnums: true,
        // identifierCase: 'snake_case',
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
        exportFromIndex: true,
        name: '@tanstack/react-query',
      },
      {
        // comments: false,
        // exportFromIndex: true,
        // name: 'valibot',
      },
      {
        // comments: false,
        // exportFromIndex: true,
        // name: 'zod',
      },
    ],
    // useOptions: false,
    // watch: 3_000,
  };
});
