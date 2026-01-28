import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsdown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const replaceCoreImports = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace '../../client-core/bundle' with '../core'
  content = content.replace(
    /from ['"]\.\.\/\.\.\/client-core\/bundle/g,
    "from '../core",
  );
  fs.writeFileSync(filePath, content, 'utf8');
};

export default defineConfig({
  alias: {
    '~': path.resolve(__dirname, 'src'),
  },
  clean: true,
  dts: {
    build: true,
  },
  entry: ['./src/{index,internal,run}.ts'],
  external: [
    // Framework-specific types that should not be bundled
    /^#/, // Nuxt/Nitro internal aliases (#app, #build, etc.)
    'nuxt',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/core',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/router',
    'vue',
    'rxjs',
    'axios',
    'ky',
    'ofetch',
    // CSS processors
    'lightningcss',
    'sass-embedded',
    'less',
    'stylus',
    // Cloudflare Workers types
    '@cloudflare/workers-types',
    /^cloudflare:/, // cloudflare:workers and other cloudflare runtime modules
    // Firebase types
    'firebase-functions',
    /^firebase-functions\//, // firebase-functions subpaths
    // Scalar API reference
    '@scalar/api-reference',
    // Build tools and webpack ecosystem
    'webpack',
    'vite',
    'esbuild',
    'rollup',
    'postcss',
    'webpack-dev-middleware',
    'mini-css-extract-plugin',
    // Other framework/runtime specific
    'undici',
  ],
  format: ['esm'],
  minify: false,
  onSuccess: async () => {
    // Copy client files to dist folder for runtime access
    const pluginNames = [
      'client-angular',
      'client-axios',
      'client-core',
      'client-fetch',
      'client-ky',
      'client-next',
      'client-nuxt',
      'client-ofetch',
    ];

    for (const pluginName of pluginNames) {
      const srcPath = path.resolve(
        __dirname,
        'src',
        'plugins',
        '@hey-api',
        pluginName,
        'bundle',
      );
      const destPath = path.resolve(
        __dirname,
        'dist',
        'clients',
        pluginName.slice('client-'.length),
      );

      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.cpSync(srcPath, destPath, { recursive: true });

        // replace core imports in client bundle
        const clientFiles = fs.readdirSync(destPath);
        for (const file of clientFiles) {
          replaceCoreImports(path.resolve(destPath, file));
        }
      }
    }
  },
  sourcemap: true,
  treeshake: true,
});
