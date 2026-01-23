import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsdown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  alias: {
    '~': path.resolve(__dirname, 'src'),
  },
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
