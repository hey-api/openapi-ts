#!/usr/bin/env node

'use strict';

const Path = require('path');
const { program } = require('commander');
const json = require('../package.json');

const params = program
    .name(Object.keys(json.bin)[0])
    .usage('[options]')
    .version(json.version)
    .requiredOption('-i, --input <value>', 'OpenAPI specification, can be a path, url or string content (required)')
    .requiredOption('-o, --output <value>', 'Output directory (required)')
    .option('-c, --client <value>', 'HTTP client to generate [fetch, xhr, node, axios, angular]')
    .option('--name <value>', 'Custom client class name')
    .option('--useOptions [value]', 'Use options instead of arguments', false)
    .option('--no-autoformat', 'Disable processing generated files with formatter')
    .option('--base [value]', 'Manually set base in OpenAPI config instead of inferring from server value')
    .option('--enums', 'Generate JavaScript objects from enum definitions', false)
    .option('--exportCore <value>', 'Write core files to disk', true)
    .option('--exportServices <value>', 'Write services to disk', true)
    .option('--exportModels <value>', 'Write models to disk', true)
    .option('--exportSchemas <value>', 'Write schemas to disk', false)
    .option('--no-operationId', 'Use path URL to generate operation ID')
    .option('--postfixServices <value>', 'Service name postfix', 'Service')
    .option('--serviceResponse [value]', 'Define shape of returned value from service calls')
    .option('--useDateType <value>', 'Output Date instead of string for the format "date-time" in the models', false)
    .option('--postfixModels <value>', 'Model name postfix')
    .option('--request <value>', 'Path to custom request file')
    .option('--no-write', 'Skip writing files to disk (used for testing)')
    .parse(process.argv)
    .opts();

const OpenAPI = require(Path.resolve(__dirname, '../dist/index.js'));

const parseBooleanOrString = value => (value === true || value === 'true' ? true : value);

if (OpenAPI) {
    OpenAPI.generate({
        ...params,
        clientName: params.name,
        exportCore: JSON.parse(params.exportCore) === true,
        exportModels: parseBooleanOrString(params.exportModels),
        exportSchemas: JSON.parse(params.exportSchemas) === true,
        exportServices: parseBooleanOrString(params.exportServices),
        useDateType: JSON.parse(params.useDateType) === true,
        useOptions: JSON.parse(params.useOptions) === true,
    })
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
