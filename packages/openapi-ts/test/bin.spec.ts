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
    expect(result.stdout.toString()).toContain('Done!');
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
      'angular',
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
      'axios',
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
      'fetch',
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
      'node',
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
      'xhr',
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
      'fetch',
      '--useOptions',
      '--exportCore',
      'true',
      '--services',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Done!');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('supports regexp parameters', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--client',
      '@hey-api/client-fetch',
      '--services',
      '^(Simple|Types)',
      '--types',
      '^(Simple|Types)',
      '--dry-run',
      'true',
    ]);
    expect(result.stdout.toString()).toContain('Done!');
    expect(result.stderr.toString()).toContain('Duplicate operationId');
  });

  it('throws error without parameters', () => {
    const result = sync('node', ['./bin/index.cjs', '--dry-run', 'true']);
    expect(result.stdout.toString()).toBe('');
    expect(result.stderr.toString()).toContain('Unexpected error occurred');
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
      '--types',
      'false',
      '--schemas',
      'false',
      '--services',
      'false',
      '--useOptions',
      'false',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: false');
    expect(result.stderr.toString()).toContain('types: false');
    expect(result.stderr.toString()).toContain('services: false');
    expect(result.stderr.toString()).toContain('schemas: false');
    expect(result.stderr.toString()).toContain('useOptions: false');
  });

  it('handles true booleans', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--debug',
      '--exportCore',
      'true',
      '--types',
      'true',
      '--schemas',
      'true',
      '--services',
      'true',
      '--useOptions',
      'true',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('types: true');
    expect(result.stderr.toString()).toContain('services: true');
    expect(result.stderr.toString()).toContain('schemas: true');
    expect(result.stderr.toString()).toContain('useOptions: true');
  });

  it('handles optional booleans', () => {
    const result = sync('node', [
      './bin/index.cjs',
      '--input',
      './test/spec/v3.json',
      '--output',
      './test/generated/bin',
      '--debug',
      '--exportCore',
      '--types',
      'foo',
      '--schemas',
      '--services',
      'bar',
      '--useOptions',
      '--dry-run',
      'true',
    ]);
    expect(result.stderr.toString()).toContain('debug: true');
    expect(result.stderr.toString()).toContain('dryRun: true');
    expect(result.stderr.toString()).toContain('exportCore: true');
    expect(result.stderr.toString()).toContain('schemas: true');
    expect(result.stderr.toString()).toContain('useOptions: true');
    expect(result.stderr.toString()).toContain("types: 'foo");
    expect(result.stderr.toString()).toContain("services: 'bar'");
  });
});
