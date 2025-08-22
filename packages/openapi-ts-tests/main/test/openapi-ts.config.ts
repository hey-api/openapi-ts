/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'node:path';

// @ts-ignore
import { customClientPlugin } from '@hey-api/custom-client/plugin';
import { defineConfig } from '@hey-api/openapi-ts';

import { getSpecsPath } from '../../utils';
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
      path: path.resolve(
        getSpecsPath(),
        '3.1.x',
        // 'invalid',
        // 'openai.yaml',
        // 'full.yaml',
        'opencode.yaml',
        // 'validators-circular-ref.json',
      ),
      // https://registry.scalar.com/@lubos-heyapi-dev-team/apis/demo-api-scalar-galaxy/latest?format=json
      // path: 'scalar:@lubos-heyapi-dev-team/demo-api-scalar-galaxy',
      // path: 'hey-api/backend',
      // path: 'hey-api/backend?branch=main&version=1.0.0',
      // path: 'https://get.heyapi.dev/hey-api/backend?branch=main&version=1.0.0',
      // path: 'http://localhost:4000/',
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
      // level: 'debug',
      path: './logs',
    },
    // name: 'foo',
    output: {
      // case: 'snake_case',
      clean: true,
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
          include: [
            'GET /event',
            // '/^[A-Z]+ /v1//',
          ],
        },
        // orphans: true,
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
          enabled: false,
          mode: 'root',
          // name: '{{name}}',
        },
        readWrite: {
          // enabled: false,
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
        name: '@hey-api/client-fetch',
        // name: 'legacy/angular',
        // strictBaseUrl: true,
        // throwOnError: true,
      },
      {
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
        // name: '@hey-api/typescript',
        // requests: '我們_data_{{name}}',
        // responses: {
        //   name: '我_responses_{{name}}',
        //   response: '他_response_{{name}}',
        // },
        // tree: true,
      },
      {
        // asClass: true,
        // auth: false,
        // classNameBuilder: '{{name}}',
        // classStructure: 'off',
        // client: false,
        // include...
        // instance: true,
        name: '@hey-api/sdk',
        // operationId: false,
        // params: 'experiment',
        // responseStyle: 'data',
        // transformer: '@hey-api/transformers',
        // transformer: true,
        validator: 'valibot',
        // validator: {
        //   request: 'zod',
        //   response: 'zod',
        // },
      },
      {
        // bigInt: true,
        // dates: true,
        // name: '@hey-api/transformers',
      },
      {
        // name: 'fastify',
      },
      {
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
        name: '@tanstack/react-query',
        // queryKeys: {
        //   name: '{{name}}QK',
        // },
        // queryOptions: {
        //   name: '{{name}}QO',
        // },
      },
      {
        // case: 'SCREAMING_SNAKE_CASE',
        // comments: false,
        definitions: 'z{{name}}Definition',
        exportFromIndex: true,
        metadata: true,
        name: 'valibot',
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
        // case: 'snake_case',
        // comments: false,
        compatibilityVersion: 3,
        dates: {
          local: true,
          // offset: true,
        },
        definitions: {
          // name: 'z{{name}}Definition',
          //   types: {
          //     infer: 'D{{name}}ZodType',
          //   },
        },
        exportFromIndex: true,
        metadata: true,
        name: 'zod',
        // requests: {
        //   // case: 'SCREAMING_SNAKE_CASE',
        //   // name: 'z{{name}}TestData',
        //   types: {
        //     infer: 'E{{name}}DataZodType',
        //   },
        // },
        // responses: {
        //   // case: 'snake_case',
        //   // name: 'z{{name}}TestResponse',
        //   types: {
        //     infer: 'F{{name}}ResponseZodType',
        //   },
        // },
        // types: {
        //   infer: {
        //     case: 'snake_case',
        //   },
        // },
      },
      {
        exportFromIndex: true,
        // name: '@hey-api/schemas',
        // type: 'json',
      },
      {
        // httpRequest
        // httpResource
        exportFromIndex: true,
        // name: '@angular/common',
      },
    ],
    // useOptions: false,
    // watch: 3_000,
  };
});
