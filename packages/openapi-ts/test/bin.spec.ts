import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

describe('bin', () => {
    it('supports required parameters', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).not.toContain('Prettier');
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates angular client', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'angular',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates axios client', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'axios',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates fetch client', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'fetch',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates node client', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'node',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates xhr client', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'xhr',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('supports all parameters', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'fetch',
            '--useOptions',
            '--exportCore',
            'true',
            '--exportServices',
            'true',
            '--exportModels',
            'true',
            '--exportSchemas',
            'true',
            '--postfixServices',
            'Service',
            '--postfixModels',
            'Dto',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('supports regexp parameters', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--exportServices',
            '^(Simple|Types)',
            '--exportModels',
            '^(Simple|Types)',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('formats output with Prettier', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
        ]);
        expect(result.stdout.toString()).toContain('Prettier');
        expect(result.stderr.toString()).toBe('');
    });

    it('lints output with ESLint', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--lint',
        ]);
        expect(result.stdout.toString()).toContain('ESLint');
        expect(result.stderr.toString()).toBe('');
    });

    it('throws error without parameters', () => {
        const result = sync('node', ['./bin/index.js', '--write', 'false']);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain('input');
    });

    it('throws error with wrong parameters', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--unknown',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain(`error: unknown option '--unknown'`);
    });

    it('displays help', () => {
        const result = sync('node', ['./bin/index.js', '--help', '--write', 'false']);
        expect(result.stdout.toString()).toContain(`Usage: openapi-ts [options]`);
        expect(result.stdout.toString()).toContain(`-i, --input <value>`);
        expect(result.stdout.toString()).toContain(`-o, --output <value>`);
        expect(result.stderr.toString()).toBe('');
    });
});

describe('cli', () => {
    it('handles false booleans', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--debug',
            '--exportCore',
            'false',
            '--exportModels',
            'false',
            '--exportSchemas',
            'false',
            '--exportServices',
            'false',
            '--format',
            'false',
            '--lint',
            'false',
            '--operationId',
            'false',
            '--useDateType',
            'false',
            '--useOptions',
            'false',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('debug: true');
        expect(result.stdout.toString()).toContain('exportCore: false');
        expect(result.stdout.toString()).toContain('exportModels: false');
        expect(result.stdout.toString()).toContain('exportSchemas: false');
        expect(result.stdout.toString()).toContain('exportServices: false');
        expect(result.stdout.toString()).toContain('format: false');
        expect(result.stdout.toString()).toContain('lint: false');
        expect(result.stdout.toString()).toContain('operationId: false');
        expect(result.stdout.toString()).toContain('useDateType: false');
        expect(result.stdout.toString()).toContain('useOptions: false');
        expect(result.stdout.toString()).toContain('write: false');
    });

    it('handles true booleans', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--debug',
            '--exportCore',
            'true',
            '--exportModels',
            'true',
            '--exportSchemas',
            'true',
            '--exportServices',
            'true',
            '--format',
            'true',
            '--lint',
            'true',
            '--operationId',
            'true',
            '--useDateType',
            'true',
            '--useOptions',
            'true',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('debug: true');
        expect(result.stdout.toString()).toContain('exportCore: true');
        expect(result.stdout.toString()).toContain('exportModels: true');
        expect(result.stdout.toString()).toContain('exportSchemas: true');
        expect(result.stdout.toString()).toContain('exportServices: true');
        expect(result.stdout.toString()).toContain('format: true');
        expect(result.stdout.toString()).toContain('lint: true');
        expect(result.stdout.toString()).toContain('operationId: true');
        expect(result.stdout.toString()).toContain('useDateType: true');
        expect(result.stdout.toString()).toContain('useOptions: true');
        expect(result.stdout.toString()).toContain('write: false');
    });

    it('handles optional booleans', () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--debug',
            '--exportCore',
            '--exportModels',
            'foo',
            '--exportSchemas',
            '--exportServices',
            'bar',
            '--format',
            '--lint',
            '--operationId',
            '--useDateType',
            '--useOptions',
            '--write',
            'false',
        ]);
        expect(result.stdout.toString()).toContain('debug: true');
        expect(result.stdout.toString()).toContain('exportCore: true');
        expect(result.stdout.toString()).toContain("exportModels: 'foo");
        expect(result.stdout.toString()).toContain('exportSchemas: true');
        expect(result.stdout.toString()).toContain("exportServices: 'bar'");
        expect(result.stdout.toString()).toContain('format: true');
        expect(result.stdout.toString()).toContain('lint: true');
        expect(result.stdout.toString()).toContain('operationId: true');
        expect(result.stdout.toString()).toContain('useDateType: true');
        expect(result.stdout.toString()).toContain('useOptions: true');
        expect(result.stdout.toString()).toContain('write: false');
    });
});
