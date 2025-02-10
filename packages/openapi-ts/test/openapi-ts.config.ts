import path from 'node:path';

import { defineConfig } from '../src';

export default defineConfig({
  // experimentalParser: false,
  input: {
    // exclude: '^#/components/schemas/ModelWithCircularReference$',
    // include:
    //   '^(#/components/schemas/import|#/paths/api/v{api-version}/simple/options)$',
    path: path.resolve(__dirname, 'spec', '3.1.x', 'full.json'),
    // path: 'http://localhost:8000/openapi.json',
    // path: './test/spec/v3-transforms.json',
    // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
    // path: 'https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml',
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
    'legacy/xhr',
    // @ts-ignore
    // {
    //   baseUrl: false,
    //   // bundle: true,
    //   name: '@hey-api/client-fetch',
    //   strictBaseUrl: true,
    // },
    // @ts-ignore
    {
      // name: '@hey-api/schemas',
      // type: 'json',
    },
    // @ts-ignore
    {
      // asClass: true,
      // auth: false,
      // client: false,
      // include...
      name: '@hey-api/sdk',
      // operationId: false,
      // serviceNameBuilder: '^Parameters',
      // throwOnError: true,
      // transformer: '@hey-api/transformers',
      // transformer: true,
      // validator: 'zod',
    },
    // @ts-ignore
    {
      bigInt: true,
      dates: true,
      // name: '@hey-api/transformers',
    },
    // @ts-ignore
    {
      // enums: 'typescript',
      // enums: 'typescript+namespace',
      // enums: 'javascript',
      // enumsCase: 'camelCase',
      // exportInlineEnums: true,
      // identifierCase: 'preserve',
      name: '@hey-api/typescript',
      // tree: true,
    },
    // @ts-ignore
    {
      // name: 'fastify',
    },
    // @ts-ignore
    {
      // name: '@tanstack/react-query',
    },
    // @ts-ignore
    {
      // name: 'zod',
    },
  ],
  // useOptions: false,
  // watch: {
  //   enabled: true,
  //   interval: 1_000,
  //   timeout: 60_000,
  // },
});
