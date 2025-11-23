import { defineConfig } from 'tsdown';

export default defineConfig((options) => ({
  banner(ctx) {
    /**
     * fix dynamic require in ESM
     * @link https://github.com/hey-api/openapi-ts/issues/1079
     */
    if (ctx.format === 'esm') {
      return {
        js: `import { createRequire } from 'module'; const require = createRequire(import.${'meta'}.url);`,
      };
    }

    return;
  },
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: !options.watch,
  shims: false,
  sourcemap: true,
  treeshake: true,
}));
