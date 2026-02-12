import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/plugin.ts'],
  format: ['cjs', 'esm'],
  minify: false,
  shims: false,
  sourcemap: true,
  treeshake: true,
});
