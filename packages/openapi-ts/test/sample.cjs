const path = require('node:path');

const main = async () => {
  /** @type {import('../src/node/index').UserConfig} */
  const config = {
    client: '@hey-api/client-fetch',
    input: './test/spec/v3.json',
    // input: 'https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/2caffd88277a4e27c95dcefc7e3b6a63a3b03297-v2-2023-11-15.json',
    output: {
      path: './test/generated/v3/',
    },
    schemas: {
      export: false,
    },
    services: {
      asClass: true,
      // export: false,
      // name: '^Parameters',
    },
    types: {
      enums: 'typescript',
      // include: '^CloudProvider',
      // name: 'PascalCase',
    },
    // useOptions: false,
  };

  const { createClient } = await import(
    path.resolve(process.cwd(), 'dist/node/index.cjs')
  );
  await createClient(config);
};

main();
