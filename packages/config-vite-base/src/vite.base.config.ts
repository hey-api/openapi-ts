import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vite';

export function createViteConfig(config: UserConfig = {}) {
  const baseConfig = defineConfig({
    build: {
      sourcemap: true,
      target: 'esnext',
    },
    esbuild: {
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  });

  return mergeConfig(baseConfig, config);
}
