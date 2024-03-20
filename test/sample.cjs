const path = require('node:path');

const main = async () => {
    /** @type {import('../src/node/index').UserConfig} */
    const config = {
        client: 'fetch',
        enums: true,
        exportSchemas: true,
        input: './test/spec/v3.json',
        output: './test/generated/v3/',
        useOptions: true,
    };

    const { createClient } = await import(path.resolve(process.cwd(), 'dist/index.js'));
    await createClient(config);
};

main();
