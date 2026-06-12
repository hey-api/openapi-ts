import { defineConfig } from 'tsdown';

export default defineConfig({
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
    profile: 'esm-only',
  },
  minify: true,
  publint: true,
  sourcemap: false,
});
