#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const pkg = require('../package.json');

program
    .name('openapi')
    .usage('[options]')
    .version(pkg.version)
    .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .requiredOption('-o, --output <value>', 'Output directory (required)')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node]', 'fetch')
    .option('--useOptions', 'Use options instead of arguments')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .parse(process.argv);

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

if (OpenAPI) {
    OpenAPI.generate({
        input: program.input,
        output: program.output,
        httpClient: program.client,
        useOptions: program.useOptions,
        useUnionTypes: program.useUnionTypes,
        exportCore: JSON.parse(program.exportCore) === true,
        exportServices: JSON.parse(program.exportServices) === true,
        exportModels: JSON.parse(program.exportModels) === true,
        exportSchemas: JSON.parse(program.exportSchemas) === true,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
