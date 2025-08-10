import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    openapiClient: 'src/generators/openapi-client/openapiClient.ts',
    updateApi: 'src/executors/update-api/updateApi.ts',
  },
  format: ['cjs'],
  minify: !options.watch,
  onSuccess: 'node scripts/copy-json-files.mjs',
  outDir: 'dist',
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.cjs' : '.js',
  }),

  shims: false,
  sourcemap: true,
  treeshake: true,
}));
