import { platform } from 'node:os';

import type { ViteUserConfig } from 'vitest/config';
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

export function createVitestConfig(
  root: string,
  config: ViteUserConfig = {},
): ViteUserConfig {
  const baseConfig = defineConfig({
    plugins: [],
    test: {
      coverage: {
        exclude: ['bin', 'dist', 'src/**/*.d.ts'],
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        provider: 'v8',
      },
      exclude: [...configDefaults.exclude],
      globals: true,
      pool: platform() === 'win32' ? 'threads' : 'forks',
      poolOptions: {
        forks: {
          singleFork: false,
        },
        threads: {
          singleThread: false,
        },
      },
      root,
      testTimeout: platform() === 'win32' ? 10000 : 5000,
    },
  });

  return mergeConfig(baseConfig, config);
}
