import fs from 'node:fs';
import path from 'node:path';

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
  entry: ['src/index.ts', 'src/internal.ts'],
  format: ['cjs', 'esm'],
  minify: !options.watch,
  onSuccess: async () => {
    // Copy client files to dist folder for runtime access
    const pluginNames = [
      // 'client-axios',
      'client-core',
      'client-fetch',
      // 'client-next',
      // 'client-nuxt',
    ];

    for (const pluginName of pluginNames) {
      const srcPath = path.resolve(
        'src',
        'plugins',
        '@hey-api',
        pluginName,
        'bundle',
      );
      const destPath = path.resolve(
        'dist',
        'clients',
        pluginName.slice('client-'.length),
      );

      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.cpSync(srcPath, destPath, { recursive: true });
      }
    }
  },
  shims: false,
  sourcemap: true,
  treeshake: true,
}));
