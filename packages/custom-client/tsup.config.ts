import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/plugin.ts'],
  format: ['cjs', 'esm'],
  minify: !options.watch,
  shims: false,
  sourcemap: true,
  treeshake: true,
}));
