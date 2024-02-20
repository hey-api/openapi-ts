#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const pkg = require('../package.json');

const params = program
    .name('openapi')
    .usage('[options]')
    .version(pkg.version)
    .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .requiredOption('-o, --output <value>', 'Output directory (required)')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios, angular]', 'fetch')
    .option('--name <value>', 'Custom client class name')
    .option('--useOptions', 'Use options instead of arguments')
    .option('--useUnionTypes', 'Use union types instead of enums')
    .option('--autoformat', 'Process generated files with autoformatter', false)
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--indent <value>', 'Indentation options [4, 2, tabs]', '4')
    .option('--postfixServices <value>', 'Service name postfix', 'Service')
    .option('--useOperationId <value>', 'Use operation id to generate operation names', true)
    .option('--postfixModels <value>', 'Model name postfix')
    .option('--request <value>', 'Path to custom request file')
    .parse(process.argv)
    .opts();

const OpenAPI = require(path.resolve(__dirname, '../dist/index.js'));

const parseBooleanOrString = value => {
    try {
        return JSON.parse(value) === true;
    } catch (error) {
        return value;
    }
};

if (OpenAPI) {
    OpenAPI.generate({
        autoformat: JSON.parse(params.autoformat) === true,
        clientName: params.name,
        exportCore: JSON.parse(params.exportCore) === true,
        exportModels: parseBooleanOrString(params.exportModels),
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        exportServices: parseBooleanOrString(params.exportServices),
        httpClient: params.client,
        indent: params.indent,
        input: params.input,
        output: params.output,
        postfixModels: params.postfixModels,
        postfixServices: params.postfixServices,
        request: params.request,
        useOperationId: JSON.parse(params.useOperationId) === true,
        useOptions: params.useOptions,
        useUnionTypes: params.useUnionTypes,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
