#!/usr/bin/env node

try {
  await import('../dist/run.mjs');
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND') {
    console.error('openapi-ts not built (expected dist/run.mjs)');
    process.exit(1);
  }
  throw error;
}
