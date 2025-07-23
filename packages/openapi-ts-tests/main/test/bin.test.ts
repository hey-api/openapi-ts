import path from 'node:path';

import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

import { getSpecsPath } from '../../utils';

describe('bin', () => {
  it('supports required parameters', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      '@hey-api/client-fetch',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('generates angular client', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/angular',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('generates axios client', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/axios',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('generates fetch client', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/fetch',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('generates node client', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/node',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('generates xhr client', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/xhr',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('supports all parameters', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      'legacy/fetch',
      '--useOptions',
      '--exportCore',
      'true',
      '--plugins',
      '@hey-api/schemas',
      '@hey-api/sdk',
      '@hey-api/typescript',
      '--dry-run',
      'true',
    ]);
    expect(result.error).toBeFalsy();
    expect(result.status).toBe(0);
  });

  it('throws error without input', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('encountered an error');
    expect(result.stderr.toString()).toContain('missing input');
  });

  it('throws error without output', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('encountered an error');
    expect(result.stderr.toString()).toContain('missing output');
  });

  it('throws error with wrong parameters', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--unknown',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain(
      `error: unknown option '--unknown'`,
    );
  });

  it('displays help', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--help',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain(`Usage: openapi-ts [options]`);
    expect(result.stdout.toString()).toContain(`-i, --input <value>`);
    expect(result.stdout.toString()).toContain(`-o, --output <value>`);
    expect(result.stderr.toString()).toBe('');
  });
});

describe('cli', () => {
  it('handles false booleans', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--debug',
      '--exportCore',
      'false',
      '--plugins',
      '--useOptions',
      'false',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: false');
    expect(result.stderr.toString()).not.toContain('@hey-api/typescript');
    expect(result.stderr.toString()).not.toContain('@hey-api/sdk');
    expect(result.stderr.toString()).not.toContain('@hey-api/schemas');
    expect(result.stderr.toString()).toContain('useOptions: false');
  });

  it('handles true booleans', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      '@hey-api/client-fetch',
      '--debug',
      '--exportCore',
      'true',
      '--plugins',
      '@hey-api/schemas',
      '@hey-api/sdk',
      '@hey-api/typescript',
      '--useOptions',
      'true',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('@hey-api/typescript');
    expect(result.stderr.toString()).toContain('@hey-api/sdk');
    expect(result.stderr.toString()).toContain('@hey-api/schemas');
    expect(result.stderr.toString()).toContain('useOptions: true');
  });

  it('handles optional booleans', () => {
    const result = sync('node', [
      path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'openapi-ts',
        'bin',
        'index.cjs',
      ),
      '--input',
      path.resolve(getSpecsPath(), 'v3.json'),
      '--output',
      path.resolve(__dirname, 'generated', 'bin'),
      '--client',
      '@hey-api/client-fetch',
      '--debug',
      '--exportCore',
      '--plugins',
      '@hey-api/schemas',
      '@hey-api/sdk',
      '@hey-api/typescript',
      '--useOptions',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('@hey-api/schemas');
    expect(result.stderr.toString()).toContain('@hey-api/sdk');
    expect(result.stderr.toString()).toContain('@hey-api/typescript');
    expect(result.stderr.toString()).toContain('useOptions: true');
  });
});
