import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

import { handlebarsPlugin } from './rollup.config';

export default defineConfig({
    plugins: [handlebarsPlugin()],
    test: {
        exclude: [...configDefaults.exclude, 'test/e2e/**/*.spec.ts'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['bin', 'dist', 'src/**/*.d.ts'],
        },
    },
});
