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
    '-c, --client <value>',
    'HTTP client to generate [@hey-api/client-axios, @hey-api/client-fetch, legacy/angular, legacy/axios, legacy/fetch, legacy/node, legacy/xhr]',
  )
  .option('-d, --debug', 'Run in debug mode?')
  .option('--dry-run [value]', 'Skip writing files to disk?')
  .option(
    '-e, --experimental-parser [value]',
    'Opt-in to the experimental parser?',
  )
  .option('-f, --file [value]', 'Path to the config file')
  .option(
    '-i, --input <value>',
    'OpenAPI specification (path, url, or string content)',
  )
  .option('-o, --output <value>', 'Output folder')
  .option('-p, --plugins [value...]', "List of plugins you'd like to use")
  .option(
    '--base [value]',
    'DEPRECATED. Manually set base in OpenAPI config instead of inferring from server value',
  )
  .option('--exportCore [value]', 'DEPRECATED. Write core files to disk')
  .option('--name <value>', 'DEPRECATED. Custom client class name')
  .option('--request <value>', 'DEPRECATED. Path to custom request file')
  .option(
    '--useOptions [value]',
    'DEPRECATED. Use options instead of arguments?',
  )
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
  if (obj.file) {
    obj.configFile = obj.file;
  }
  return obj;
};

async function start() {
  let userConfig;
  try {
    const { createClient } = require(resolve(__dirname, '../dist/index.cjs'));
    userConfig = processParams(params, [
      'dryRun',
      'experimentalParser',
      'exportCore',
      'useOptions',
    ]);
    if (params.plugins === true) {
      userConfig.plugins = [];
    } else if (params.plugins) {
      userConfig.plugins = params.plugins;
    }
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
