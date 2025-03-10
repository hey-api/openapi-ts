import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { UserConfig } from '@hey-api/openapi-ts';
import { createClient } from '@hey-api/openapi-ts';
import { addImportsSources, defineNuxtModule, useNuxt } from '@nuxt/kit';
import type {} from '@nuxt/schema';
import { defu } from 'defu';
import { createJiti } from 'jiti';
import { findExports, findTypeExports } from 'mlly';
import { findPath } from 'nuxt/kit';

interface ModuleOptions {
  autoImport?: boolean;
  config: Omit<UserConfig, 'output'> & Partial<Pick<UserConfig, 'output'>>;
}

export default defineNuxtModule<ModuleOptions>({
  defaults: {
    autoImport: true,
  },
  meta: {
    configKey: 'heyapi',
    name: '@hey-api/client-nuxt',
  },
  async setup(options) {
    const nuxt = useNuxt();

    nuxt.options.build.transpile.push('@hey-api/client-nuxt/runtime');

    const jiti = createJiti(nuxt.options.rootDir);
    const _config = await jiti.import<UserConfig>('./openapi-ts.config.ts', {
      default: true,
      try: true,
    });
    const config = defu(options.config, _config, {
      logs: {
        level: 'silent',
      },
      output: {
        path: join(nuxt.options.buildDir, 'openapi-client'),
      },
      plugins: ['@hey-api/client-nuxt'],
    } satisfies Partial<UserConfig>);

    const folder = resolve(
      nuxt.options.rootDir,
      typeof config.output === 'string' ? config.output : config.output.path,
    );

    nuxt.options.alias['#hey-api'] = folder;

    async function writeClient() {
      await createClient(config as UserConfig);
    }

    nuxt.hooks.hookOnce('app:templates', writeClient);

    if (options.autoImport) {
      await writeClient();
      const typeImports = new Set<string>();
      const imports = new Set<string>();
      const files = findExports(
        readFileSync(join(folder, 'index.ts'), 'utf-8'),
      );
      for (const file of files) {
        if (!file.specifier || !/^\.{1,2}\//.test(file.specifier)) {
          continue;
        }
        const path = await findPath(resolve(folder, file.specifier));
        if (!path) {
          continue;
        }
        const blob = readFileSync(path, 'utf-8');
        for (const { names } of findTypeExports(blob)) {
          for (const name of names) {
            typeImports.add(name);
          }
        }
        for (const { names } of findExports(blob)) {
          for (const name of names) {
            imports.add(name);
          }
        }
      }

      addImportsSources({
        from: '#hey-api',
        imports: [
          ...[...typeImports].map((name) => ({ name, type: true })),
          ...imports,
        ],
      });
    }
  },
});
