import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

import { handlebarsPlugin } from './rollup.config'

export default defineConfig({
  plugins: [handlebarsPlugin()],
  test: {
    // Dont run tests in parallel. This is to ensure the test server can start up.
    // And that the port was not previously taken.
    fileParallelism: false,
    include: ['test/e2e/**/*.spec.ts'],
    root: fileURLToPath(new URL('./', import.meta.url))
  }
})
