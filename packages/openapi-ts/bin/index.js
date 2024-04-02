#!/usr/bin/env node

'use strict';

import { readFileSync } from 'node:fs';

import { program } from 'commander';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)).toString());

const params = program
    .name(Object.keys(pkg.bin)[0])
    .usage('[options]')
    .version(pkg.version)
    .option('-i, --input <value>', 'OpenAPI specification (path, url, or string content)')
    .option('-o, --output <value>', 'Output directory')
    .option('-c, --client <value>', 'HTTP client to generate [angular, axios, fetch, node, xhr]')
    .option('-d, --debug', 'Run in debug mode?')
    .option('--base [value]', 'Manually set base in OpenAPI config instead of inferring from server value')
    .option('--enums <value>', 'Export enum definitions (javascript, typescript)')
    .option('--exportCore [value]', 'Write core files to disk')
    .option('--exportModels [value]', 'Write models to disk')
    .option('--exportSchemas [value]', 'Write schemas to disk')
    .option('--exportServices [value]', 'Write services to disk')
    .option('--format [value]', 'Process output folder with formatter?')
    .option('--lint [value]', 'Process output folder with linter?')
    .option('--name <value>', 'Custom client class name')
    .option('--operationId [value]', 'Use operationd ID?')
    .option('--postfixModels <value>', 'Model name postfix')
    .option('--postfixServices <value>', 'Service name postfix')
    .option('--request <value>', 'Path to custom request file')
    .option('--serviceResponse [value]', 'Define shape of returned value from service calls')
    .option('--useDateType [value]', 'Output Date instead of string for the format "date-time" in the models')
    .option('--useOptions [value]', 'Use options instead of arguments')
    .option('--write [value]', 'Write files to disk? (used for testing)')
    .parse(process.argv)
    .opts();

const stringToBoolean = value => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
};

const processParams = (obj, keys) => {
    const result = {};
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === 'string') {
            result[key] = stringToBoolean(value);
        }
    }
    return result;
};

async function start() {
    try {
        const { createClient } = await import(new URL('../dist/node/index.js', import.meta.url));
        await createClient({
            ...params,
            ...processParams(params, [
                'exportCore',
                'exportModels',
                'exportSchemas',
                'exportServices',
                'format',
                'lint',
                'operationId',
                'useDateType',
                'useOptions',
                'write',
            ]),
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
