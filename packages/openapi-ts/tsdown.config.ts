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
  clean: true,
  dts: {
    build: true,
  },
  entry: ['./src/{index,internal,run}.ts'],
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
