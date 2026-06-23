#!/usr/bin/env node

import { runCli } from '@hey-api/codegen-cli';

import pkg from '../package.json';
import { createClient } from './index';

const binName = Object.keys(pkg.bin)[0]!;

runCli({
  createClient,
  meta: {
    description: 'Generate Python code from OpenAPI specifications',
    name: binName,
    version: pkg.version,
  },
});
