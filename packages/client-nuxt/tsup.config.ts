import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/module.ts'],
  format: ['esm'],
  minify: !options.watch,
  shims: false,
  sourcemap: true,
  treeshake: true,
}));
