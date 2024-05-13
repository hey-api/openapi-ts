#!/usr/bin/env node

'use strict';

const { writeFileSync } = require('fs');
const { resolve } = require('path');

const { program } = require('commander');
const pkg = require('../package.json');

const params = program
  .name(Object.keys(pkg.bin)[0])
  .usage('[options]')
  .version(pkg.version)
  .option(
    '--base [value]',
    'Manually set base in OpenAPI config instead of inferring from server value',
  )
  .option(
    '-c, --client <value>',
    'HTTP client to generate [angular, axios, fetch, node, xhr]',
  )
  .option('-d, --debug', 'Run in debug mode?')
  .option('--dry-run [value]', 'Skip writing files to disk?')
  .option('--exportCore [value]', 'Write core files to disk')
  .option(
    '-i, --input <value>',
    'OpenAPI specification (path, url, or string content)',
  )
  .option('--name <value>', 'Custom client class name')
  .option('-o, --output <value>', 'Output directory')
  .option('--request <value>', 'Path to custom request file')
  .option('--schemas [value]', 'Write schemas to disk')
  .option('--services [value]', 'Write services to disk')
  .option('--types [value]', 'Write types to disk')
  .option('--useOptions [value]', 'Use options instead of arguments')
  .parse(process.argv)
  .opts();

const stringToBoolean = (value) => {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return value;
};

const processParams = (obj, booleanKeys) => {
  for (const key of booleanKeys) {
    const value = obj[key];
    if (typeof value === 'string') {
      const parsedValue = stringToBoolean(value);
      delete obj[key];
      obj[key] = parsedValue;
    }
  }
  return obj;
};

async function start() {
  let userConfig;
  try {
    const { createClient } = require(
      resolve(__dirname, '../dist/node/index.cjs'),
    );
    userConfig = processParams(params, [
      'dryRun',
      'exportCore',
      'schemas',
      'services',
      'types',
      'useOptions',
    ]);
    await createClient(userConfig);
    process.exit(0);
  } catch (error) {
    if (!userConfig?.dryRun) {
      const logName = `openapi-ts-error-${Date.now()}.log`;
      const logPath = resolve(process.cwd(), logName);
      writeFileSync(logPath, `${error.message}\n${error.stack}`);
      console.error(`🔥 Unexpected error occurred. Log saved to ${logPath}`);
    }
    console.error(`🔥 Unexpected error occurred. ${error.message}`);
    process.exit(1);
  }
}

start();
