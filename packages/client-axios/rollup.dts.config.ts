import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

import { externalDependencies } from './rollup.config';

export default defineConfig({
  external: externalDependencies,
  input: {
    index: './temp/node/index.d.ts',
  },
  output: {
    dir: './dist/node',
    format: 'cjs',
  },
  plugins: [dts({ respectExternal: true })],
});
