import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

describe('bin', () => {
  it('supports required parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      '@hey-api/client-fetch',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Generating from');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('generates angular client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'legacy/angular',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('generates axios client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'legacy/axios',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('generates fetch client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'legacy/fetch',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('generates node client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'legacy/node',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('generates xhr client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'legacy/xhr',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('supports all parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
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
    expect(result.stdout.toString()).toContain('Generating from');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('throws error without input', () => {
    const result = sync('node', ['./bin/index.cjs', '--dry-run', 'true']);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('Unexpected error occurred');
    expect(result.stderr.toString()).toContain('missing input');
  });

  it('throws error without output', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('Unexpected error occurred');
    expect(result.stderr.toString()).toContain('missing output');
  });

  it('throws error with wrong parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--unknown',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain(
      `error: unknown option '--unknown'`,
    );
  });

  it('throws error with wrong client', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      'invalid/client',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('Unexpected error occurred');
    expect(result.stderr.toString()).toContain('invalid client');
  });

  it('displays help', () => {
    const result = sync('node', [
      './bin/index.cjs',
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
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
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
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
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
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
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
