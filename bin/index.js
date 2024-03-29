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
    .option('--name <value>', 'Custom client class name')
    .option('--useOptions [value]', 'Use options instead of arguments')
    .option('--base [value]', 'Manually set base in OpenAPI config instead of inferring from server value')
    .option('--enums <value>', 'Export enum definitions (javascript, typescript)')
    .option('--exportCore <value>', 'Write core files to disk')
    .option('--exportServices <value>', 'Write services to disk')
    .option('--exportModels <value>', 'Write models to disk')
    .option('--exportSchemas <value>', 'Write schemas to disk')
    .option('--format', 'Process output folder with formatter?')
    .option('--no-format', 'Disable processing output folder with formatter')
    .option('--lint', 'Process output folder with linter?')
    .option('--no-lint', 'Disable processing output folder with linter')
    .option('--operationId', 'Use operationd ID?')
    .option('--no-operationId', 'Use path URL to generate operation ID')
    .option('--postfixServices <value>', 'Service name postfix')
    .option('--serviceResponse [value]', 'Define shape of returned value from service calls')
    .option('--useDateType <value>', 'Output Date instead of string for the format "date-time" in the models')
    .option('--postfixModels <value>', 'Model name postfix')
    .option('--request <value>', 'Path to custom request file')
    .option('--write', 'Write files to disk? (used for testing)')
    .option('--no-write', 'Skip writing files to disk (used for testing)')
    .parse(process.argv)
    .opts();

async function start() {
    try {
        const { createClient } = await import(new URL('../dist/node/index.js', import.meta.url));
        await createClient(params);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
