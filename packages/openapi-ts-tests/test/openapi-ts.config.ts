/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'node:path';

// @ts-ignore
import { customClientPlugin } from '@hey-api/custom-client/plugin';
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
      path: path.resolve(
        __dirname,
        'spec',
        '3.1.x',
        // 'case.yaml',
        // 'enum-inline.yaml',
        'full.yaml',
        // 'transformers-all-of.yaml',
        // 'validators-circular-ref-2.yaml',
      ),
      // path: path.resolve(__dirname, 'spec', 'v3-transforms.json'),
      // path: path.resolve(__dirname, 'spec', 'v3.json'),
      // path: 'http://localhost:4000/',
      // path: 'https://get.heyapi.dev/',
      // path: 'https://get.heyapi.dev/hey-api/backend?branch=main&version=1.0.0',
      // path: 'http://localhost:8000/openapi.json',
      // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
      // path: 'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
      // project: 'backend',
      // project: 'upload-openapi-spec',
      // version: '1.0.0',
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
      // tsConfigPath: path.resolve(
      //   __dirname,
      //   'tsconfig',
      //   'tsconfig.nodenext.json',
      // ),
    },
    parser: {
      filters: {
        // deprecated: false,
        operations: {
          // include: [
          //   'GET /api/v{api-version}/defaults',
          //   // '/^[A-Z]+ /v1//',
          // ],
        },
        // orphans: false,
        // preserveOrder: true,
        // schemas: {
        //   include: ['Foo'],
        // },
        // tags: {
        //   exclude: ['bar'],
        // },
      },
      pagination: {
        // keywords: ['aa'],
      },
      patch: {
        // operations: {
        //   'GET /foo': (operation: any) => {
        //     operation.responses['200'].description = 'foo';
        //   },
        // },
        // version: () => '3.1.1',
      },
      transforms: {
        enums: {
          // enabled: false,
          mode: 'root',
          // name: '{{name}}',
        },
        readWrite: {
          enabled: false,
          requests: '{{name}}Writable',
          responses: '{{name}}',
        },
      },
      validate_EXPERIMENTAL: true,
    },
    plugins: [
      // customClientPlugin({
      //   baseUrl: false,
      // }),
      // myClientPlugin(),
      {
        // baseUrl: false,
        // exportFromIndex: true,
        // $name: '@hey-api/client-axios',
        // $name: 'legacy/angular',
        // strictBaseUrl: true,
        // throwOnError: true,
      },
      {
        $name: '@hey-api/typescript',
        // case: 'snake_case',
        // definitions: '你_snake_{{name}}',
        enums: {
          // case: 'PascalCase',
          // constantsIgnoreNull: true,
          // enabled: false,
          // mode: 'typescript',
        },
        // errors: {
        //   error: '他們_error_{{name}}',
        //   name: '你們_errors_{{name}}',
        // },
        // requests: '我們_data_{{name}}',
        // responses: {
        //   name: '我_responses_{{name}}',
        //   response: '他_response_{{name}}',
        // },
        // tree: true,
      },
      {
        $name: '@hey-api/sdk',
        // asClass: true,
        // auth: false,
        // classNameBuilder: '{{name}}',
        // classStructure: 'off',
        // client: false,
        // include...
        // instance: true,
        // operationId: false,
        // responseStyle: 'data',
        // throwOnError: true,
        // transformer: '@hey-api/transformers',
        // transformer: true,
        // validator: {
        //   request: 'zod',
        //   response: 'valibot',
        // },
      },
      {
        // $name: '@hey-api/transformers',
        // bigInt: true,
        // dates: true,
      },
      {
        // $name: 'fastify',
      },
      {
        $name: '@tanstack/react-query',
        // case: 'SCREAMING_SNAKE_CASE',
        // comments: false,
        exportFromIndex: true,
        // infiniteQueryKeys: {
        //   name: '{{name}}IQK',
        // },
        // infiniteQueryOptions: {
        //   name: '{{name}}IQO',
        // },
        // mutationOptions: {
        //   name: '{{name}}MO',
        // },
        // queryKeys: {
        //   name: '{{name}}QK',
        // },
        // queryOptions: {
        //   name: '{{name}}QO',
        // },
      },
      {
        // $name: 'valibot',
        // case: 'SCREAMING_SNAKE_CASE',
        // comments: false,
        definitions: 'z{{name}}Definition',
        // exportFromIndex: true,
        metadata: true,
        requests: {
          // case: 'SCREAMING_SNAKE_CASE',
          name: 'z{{name}}TestData',
        },
        responses: {
          // case: 'snake_case',
          name: 'z{{name}}TestResponse',
        },
      },
      {
        // $name: 'zod',
        // case: 'snake_case',
        // comments: false,
        // dates: {
        //   // offset: false,
        // },
        definitions: 'z{{name}}Definition',
        // exportFromIndex: true,
        // metadata: true,
        requests: {
          // case: 'SCREAMING_SNAKE_CASE',
          // name: 'z{{name}}TestData',
        },
        responses: {
          // case: 'snake_case',
          // name: 'z{{name}}TestResponse',
        },
      },
      {
        // $name: '@hey-api/schemas',
        exportFromIndex: true,
        // type: 'json',
      },
    ],
    // useOptions: false,
    // watch: 3_000,
  };
});
