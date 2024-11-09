const path = require('node:path');

const main = async () => {
  /** @type {import('../src').UserConfig} */
  const config = {
    client: {
      // bundle: true,
      // name: '@hey-api/client-axios',
      name: '@hey-api/client-fetch',
    },
    // debug: true,
    experimentalParser: true,
    input: {
      // include:
      //   '^(#/components/schemas/import|#/paths/api/v{api-version}/simple/options)$',
      path: './test/spec/3.1.x/array-items-one-of-length-1.json',
      // path: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
    },
    // name: 'foo',
    output: {
      // format: 'prettier',
      // lint: 'eslint',
      path: './test/generated/sample/',
    },
    plugins: [
      {
        // name: '@hey-api/schemas',
        // type: 'json',
      },
      {
        // asClass: true,
        // include...
        // name: '@hey-api/services',
        // serviceNameBuilder: '^Parameters',
      },
      {
        // dates: true,
        // name: '@hey-api/transformers',
      },
      {
        // enums: 'typescript',
        // enums: 'typescript+namespace',
        // enums: 'javascript',
        name: '@hey-api/types',
        // style: 'PascalCase',
        tree: true,
      },
      {
        // name: '@tanstack/react-query',
      },
      {
        // name: 'zod',
      },
    ],
    // useOptions: false,
  };

  const { createClient } = await import(
    path.resolve(process.cwd(), 'dist', 'index.cjs')
  );
  await createClient(config);
};

main();
