import path from 'node:path';

import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const files = ['index.d.ts', 'index.d.cts', 'plugin.d.ts', 'plugin.d.cts'];

export default files.map((file) =>
  defineConfig({
    external: (id) => {
      const normalizedId = id.split(path.sep).join('/');
      return (
        !normalizedId.startsWith('/') && !/^[a-zA-Z]:\//.test(normalizedId)
      );
    },
    input: `./dist/${file}`,
    output: {
      file: `./dist/${file}`,
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  }),
);
