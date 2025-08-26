import { fileURLToPath } from 'node:url'

import { createVitestConfig } from '@config/vite-base'
import { configDefaults, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  createVitestConfig(fileURLToPath(new URL('./', import.meta.url)), {
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**']
    }
  })
)
