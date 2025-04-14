import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  banner(ctx) {
    /**
     * fix dynamic require in ESM
     * @link https://github.com/hey-api/openapi-ts/issues/1079
     */
    if (ctx.format === 'esm') {
      return {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      };
    }
  },
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    openapiClient: 'src/generators/openapi-client/index.ts',
    updateApi: 'src/executors/update-api/index.ts',
  },
  format: ['cjs', 'esm'],
  minify: !options.watch,
  onSuccess: 'node scripts/copy-json-files.mjs',
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  shims: false,
  sourcemap: true,
  treeshake: true,
}));
