import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { handlebarsPlugin } from './rollup.config';

export default defineConfig({
    plugins: [handlebarsPlugin()],
    test: {
        include: ['test/e2e/**/*.spec.ts'],
        root: fileURLToPath(new URL('./', import.meta.url)),
    },
});
