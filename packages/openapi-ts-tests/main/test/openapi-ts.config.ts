/* eslint-disable @typescript-eslint/no-unused-vars */
import path from 'node:path';

// @ts-ignore
import { customClientPlugin } from '@hey-api/custom-client/plugin';
// @ts-ignore
import { defineConfig, utils } from '@hey-api/openapi-ts';

import { getSpecsPath } from '../../utils';
// @ts-ignore
import { myClientPlugin } from './custom/client/plugin';

// @ts-ignore
// eslint-disable-next-line arrow-body-style
export default defineConfig(() => {
  // ...
  return [
    {
      // experimentalParser: false,
      input: [
        {
          // fetch: {
          //   headers: {
          //     'x-foo': 'bar',
          //   },
          // },
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
            '3.0.x',
            // 'circular.yaml',
            'dutchie.json',
            // 'invalid',
            // 'openai.yaml',
            // 'full.yaml',
            // 'opencode.yaml',
            // 'sdk-instance.yaml',
            // 'string-with-format.yaml',
            // 'transformers.json',
            // 'type-format.yaml',
            // 'validators.yaml',
            // 'validators-circular-ref-2.yaml',
            // 'zoom-video-sdk.json',
          ),
          // path: 'https://get.heyapi.dev/hey-api/backend?branch=main&version=1.0.0',
          // path: 'http://localhost:4000/',
          // path: 'http://localhost:8000/openapi.json',
          // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
          // path: 'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
          // watch: {
          //   enabled: true,
          //   interval: 500,
          //   timeout: 30_000,
          // },
        },
        // path.resolve(getSpecsPath(), '3.1.x', 'full.yaml'),
        // {
        //   branch: 'main',
        //   organization: 'hey-api',
        //   path: 'hey-api/backend',
        //   project: 'backend',
        //   project: 'upload-openapi-spec',
        //   version: '1.0.0',
        // },
        // 'hey-api/backend?branch=main&version=1.0.0',
        // 'scalar:@scalar/access-service',
        // 'readme:@developers/v2.0#nysezql0wwo236',
        // 'readme:nysezql0wwo236',
        // 'https://dash.readme.com/api/v1/api-registry/nysezql0wwo236',
        // 'https://somefakedomain.com/openapi.yaml',
      ],
      logs: {
        // level: 'debug',
        path: './logs',
      },
      // name: 'foo',
      output: [
        // {
        //   // case: 'snake_case',
        //   clean: true,
        //   fileName: {
        //     // case: 'snake_case',
        //     // name: '{{name}}.renamed',
        //     suffix: '.meh',
        //   },
        //   // format: 'prettier',
        //   importFileExtension: '.ts',
        //   // indexFile: false,
        //   // lint: 'eslint',
        //   path: path.resolve(__dirname, 'generated', 'sample'),
        //   tsConfigPath: path.resolve(
        //     __dirname,
        //     'tsconfig',
        //     'tsconfig.nodenext.json',
        //   ),
        // },
        path.resolve(__dirname, 'generated', 'sample'),
      ],
      parser: {
        filters: {
          // deprecated: false,
          operations: {
            include: [
              // 'GET /event',
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
        hooks: {
          operations: {
            getKind() {
              // noop
            },
            isMutation() {
              // noop
            },
            isQuery: (op) => {
              if (op.method === 'post' && op.path === '/search') {
                return true;
              }
              return;
            },
          },
          symbols: {
            // getFilePath: (symbol) => {
            //   if (symbol.name) {
            //     return symbol.name[0]?.toLowerCase();
            //   }
            //   return;
            // },
          },
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
          // enums: {
          //   enabled: false,
          //   mode: 'root',
          //   // name: '{{name}}',
          // },
          // propertiesRequiredByDefault: true,
          // readWrite: {
          //   // enabled: false,
          //   requests: '{{name}}Writable',
          //   responses: '{{name}}',
          // },
        },
        // validate_EXPERIMENTAL: true,
      },
      plugins: [
        // customClientPlugin({
        //   baseUrl: false,
        // }),
        // myClientPlugin(),
        {
          // baseUrl: false,
          exportFromIndex: true,
          name: '@hey-api/client-fetch',
          // name: 'legacy/angular',
          // runtimeConfigPath: path.resolve(__dirname, 'hey-api.ts'),
          runtimeConfigPath: './src/hey-api.ts',
          // strictBaseUrl: true,
          // throwOnError: true,
        },
        {
          // case: 'snake_case',
          // definitions: '你_snake_{{name}}',
          // enums: {
          //   // case: 'PascalCase',
          //   // constantsIgnoreNull: true,
          //   // enabled: false,
          //   mode: 'javascript',
          // },
          // errors: {
          //   error: '他們_error_{{name}}',
          //   name: '你們_errors_{{name}}',
          // },
          name: '@hey-api/typescript',
          // requests: '我們_data_{{name}}',
          // responses: {
          //   name: '我_responses_{{name}}',
          //   response: '他_response_{{name}}',
          // },
          // topType: 'any',
          // tree: true,
          // webhooks: {
          //   name: 'Webby{{name}}Hook',
          //   payload: '{{name}}WebhookEvent',
          // },
        },
        {
          asClass: true,
          // auth: false,
          // classNameBuilder: '{{name}}',
          // classNameBuilder: '{{name}}Service',
          // classStructure: 'off',
          // client: false,
          // getSignature: ({ fields, signature, operation }) => {
          //   // ...
          //   fields.unwrap('path')
          // },
          // include...
          // instance: true,
          name: '@hey-api/sdk',
          // operationId: false,
          // params_EXPERIMENTAL: 'experiment',
          // responseStyle: 'data',
          // signature: 'auto',
          // signature: 'client',
          // signature: 'object',
          // transformer: '@hey-api/transformers',
          // transformer: true,
          // validator: {
          //   request: 'valibot',
          //   response: 'zod',
          // },
          '~hooks': {
            symbols: {
              // getFilePath: (symbol) => {
              //   if (symbol.name) {
              //     return utils.stringCase({
              //       case: 'camelCase',
              //       value: symbol.name,
              //     });
              //   }
              //   return;
              // },
            },
          },
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
          // queryOptions: false,
          // queryOptions: {
          //   name: '{{name}}QO',
          // },
          useQuery: true,
          '~hooks': {
            operations: {
              getKind: (op) => {
                if (op.method === 'post' && op.path === '/search') {
                  return ['query'];
                }
                return;
              },
              isMutation() {
                // noop
              },
              isQuery: () => {
                // noop
              },
            },
          },
        },
        {
          // case: 'SCREAMING_SNAKE_CASE',
          // comments: false,
          // definitions: 'z{{name}}Definition',
          exportFromIndex: true,
          // metadata: true,
          name: 'valibot',
          // requests: {
          //   case: 'PascalCase',
          //   name: '{{name}}Data',
          // },
          // responses: {
          //   // case: 'snake_case',
          //   name: 'z{{name}}TestResponse',
          // },
          // webhooks: {
          //   name: 'q{{name}}CoolWebhook',
          // },
          '~hooks': {
            symbols: {
              // getFilePath: (symbol) => {
              //   if (symbol.name) {
              //     return utils.stringCase({
              //       case: 'camelCase',
              //       value: symbol.name,
              //     });
              //   }
              //   return;
              // },
            },
          },
        },
        {
          // case: 'snake_case',
          // comments: false,
          compatibilityVersion: 'mini',
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
          responses: {
            // case: 'snake_case',
            // name: (name) => {
            //   if (name === 'complexTypes') {
            //     return 'z';
            //   }
            //   return 'z{{name}}Response';
            // },
            // types: {
            //   infer: 'F{{name}}ResponseZodType',
            // },
          },
          types: {
            // infer: {
            //   case: 'snake_case',
            // },
          },
          '~hooks': {
            symbols: {
              // getFilePath: (symbol) => {
              //   if (symbol.name === 'z') {
              //     return 'complexService';
              //   }
              //   return;
              // },
            },
          },
        },
        {
          exportFromIndex: true,
          // name: '@hey-api/schemas',
          // type: 'json',
        },
        {
          exportFromIndex: true,
          httpRequests: {
            // asClass: true,
          },
          httpResources: {
            // asClass: true,
          },
          // name: '@angular/common',
        },
        {
          exportFromIndex: true,
          // mutationOptions: '{{name}}Mutationssss',
          // name: '@pinia/colada',
          // queryOptions: {
          //   name: '{{name}}Queryyyyy',
          // },
          queryKeys: {
            tags: true,
          },
          '~hooks': {
            operations: {
              getKind: (op) => {
                if (op.method === 'post' && op.path === '/search') {
                  return ['query'];
                }
                return;
              },
            },
          },
        },
      ],
      // useOptions: false,
      // watch: 3_000,
    },
    // {
    //   input: 'scalar:@scalar/access-service',
    //   logs: {
    //     // level: 'debug',
    //     path: './logs',
    //   },
    //   output: path.resolve(__dirname, 'generated', 'sample'),
    // },
  ];
});
