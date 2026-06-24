import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'tsdown';

export default defineConfig({
  attw: {
    ignoreRules: ['cjs-resolves-to-esm'],
    profile: 'esm-only',
  },
  entry: ['./src/{index,plugins,run}.ts'],
  onSuccess: async () => {
    // Copy client files to dist folder for runtime access
    const pluginNames = [
      'client-aiohttp',
      'client-core',
      'client-httpx',
      'client-requests',
      'client-urllib3',
    ];

    for (const pluginName of pluginNames) {
      const srcPath = path.resolve(
        import.meta.dirname,
        'src',
        'plugins',
        '@hey-api',
        pluginName,
        'bundle',
      );
      const destPath = path.resolve(
        import.meta.dirname,
        'dist',
        'clients',
        pluginName.slice('client-'.length),
      );

      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.cpSync(srcPath, destPath, { recursive: true });

        // replace core imports in client bundle
        // const clientFiles = fs.readdirSync(destPath);
        // for (const file of clientFiles) {
        //   replaceCoreImports(path.resolve(destPath, file));
        // }
      }
    }
  },
  publint: true,
  sourcemap: true,
});
