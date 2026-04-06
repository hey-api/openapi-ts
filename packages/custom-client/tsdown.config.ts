import { defineConfig } from 'tsdown';

export default defineConfig({
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
    profile: 'esm-only',
  },
  entry: ['src/index.ts', 'src/plugin.ts'],
  publint: true,
  sourcemap: true,
});
