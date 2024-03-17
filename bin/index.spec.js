const { sync } = require('cross-spawn');

describe('bin', () => {
    it('it should support minimal params', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('it should support all params', async () => {
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
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('it should support regexp params', async () => {
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
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('should autoformat with Prettier', async () => {
        const result = sync('node', [
            './bin/index.js',
            '--input',
            './test/spec/v3.json',
            '--output',
            './test/generated/bin',
            '--no-write',
        ]);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toBe('');
    });

    it('it should throw error without params', async () => {
        const result = sync('node', ['./bin/index.js', '--no-write']);
        expect(result.stdout.toString()).toBe('');
        expect(result.stderr.toString()).toContain(`error: required option '-i, --input <value>' not specified`);
    });

    it('it should throw error with wrong params', async () => {
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

    it('it should display help', async () => {
        const result = sync('node', ['./bin/index.js', '--help', '--no-write']);
        expect(result.stdout.toString()).toContain(`Usage: openapi [options]`);
        expect(result.stdout.toString()).toContain(`-i, --input <value>`);
        expect(result.stdout.toString()).toContain(`-o, --output <value>`);
        expect(result.stderr.toString()).toBe('');
    });
});
