import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: {
    build: true,
  },
  entry: ['./src/{index,run}.ts'],
  format: ['esm'],
  minify: false,
  sourcemap: true,
  treeshake: true,
});
