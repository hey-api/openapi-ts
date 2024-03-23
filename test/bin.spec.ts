import { sync } from 'cross-spawn';
import { describe, expect, it } from 'vitest';

describe('bin', () => {
    it('supports required parameters', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--no-write',
        ]);
        expect(result.stdout.toString()).not.toContain('Prettier');
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates angular client', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'angular',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates axios client', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'axios',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates fetch client', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'fetch',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates node client', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'node',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('generates xhr client', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--client',
            'xhr',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('');
        expect(result.stderr.toString()).toBe('');
    });

    it('supports all parameters', async () => {
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
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('supports regexp parameters', async () => {
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
            '--no-write',
        ]);
        expect(result.stdout.toString()).toContain('Done!');
        expect(result.stderr.toString()).toBe('');
    });

    it('formats output with Prettier', async () => {
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

    it('lints output with ESLint', async () => {
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

    it('throws error without parameters', async () => {
        const result = sync('node', ['./bin/index.js', '--no-write']);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain('input');
    });

    it('throws error with wrong parameters', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--unknown',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain(`error: unknown option '--unknown'`);
    });

    it('displays help', async () => {
        const result = sync('node', ['./bin/index.js', '--help', '--no-write']);
        expect(result.stdout.toString()).toContain(`Usage: openapi-ts [options]`);
        expect(result.stdout.toString()).toContain(`-i, --input <value>`);
        expect(result.stdout.toString()).toContain(`-o, --output <value>`);
        expect(result.stderr.toString()).toBe('');
    });
});
