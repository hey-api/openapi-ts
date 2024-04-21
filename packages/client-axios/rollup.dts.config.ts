import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

import { externalDependencies } from './rollup.config';

export default defineConfig({
  external: externalDependencies,
  input: {
    index: './temp/index.d.ts',
  },
  output: {
    dir: './dist',
    format: 'cjs',
  },
  plugins: [dts({ respectExternal: true })],
});
