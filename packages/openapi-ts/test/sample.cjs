const path = require('node:path');

const main = async () => {
  /** @type {import('../src/node/index').UserConfig} */
  const config = {
    client: 'fetch',
    enums: 'javascript',
    input: './test/spec/v3.json',
    output: './test/generated/v3/',
    schemas: {
      // export: false,
    },
    services: {
      // export: false,
    },
    types: {
      // include: '^DictionaryWithPropertiesAndAdditionalProperties',
    },
  };

  const { createClient } = await import(
    path.resolve(process.cwd(), 'dist/node/index.cjs')
  );
  await createClient(config);
};

main();
