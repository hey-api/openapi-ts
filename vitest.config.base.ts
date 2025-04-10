import { defineConfig } from 'vitest/config';

// Base configuration that can be extended by individual packages
export const createBaseConfig = (rootPath: string) =>
  defineConfig({
    test: {
      coverage: {
        exclude: ['dist', 'src/**/*.d.ts'],
        include: ['src/**/*.ts'],
        provider: 'v8',
      },
      // Use process forks instead of worker threads on Windows to avoid tinypool issues
      pool: 'forks',

      root: rootPath,
      // Increase timeout for Windows
      testTimeout: process.platform === 'win32' ? 15000 : 5000,
    },
  });
