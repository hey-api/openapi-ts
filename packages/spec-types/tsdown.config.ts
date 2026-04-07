import { defineConfig } from 'tsdown';

export default defineConfig({
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
    profile: 'esm-only',
  },
  publint: true,
  sourcemap: true,
});
