import fs from 'node:fs';
import path from 'node:path';

import type { UserConfig } from '@hey-api/openapi-ts';
import { createClient } from '@hey-api/openapi-ts';
import { addImportsSources, defineNuxtModule, useNuxt } from '@nuxt/kit';
import type {} from '@nuxt/schema';
import { defu } from 'defu';
import { findExports, findTypeExports } from 'mlly';
import { findPath } from 'nuxt/kit';

interface ModuleOptions {
  /**
   * Module alias.
   *
   * @default '#hey-api'
   */
  alias?: string;
  /**
   * Automatically import all re-exported identifiers from the index file?
   * You may want to disable this option if the imported identifier names
   * clash with identifier names from other modules.
   *
   * @default true
   */
  autoImport?: boolean;
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config: Omit<UserConfig, 'output'> & Partial<Pick<UserConfig, 'output'>>;
}

export default defineNuxtModule<ModuleOptions>({
  defaults: {
    alias: '#hey-api',
    autoImport: true,
  },
  meta: {
    configKey: 'heyApi',
    name: '@hey-api/nuxt',
  },
  async setup(options) {
    const nuxt = useNuxt();

    const config = defu(options.config, {
      output: {
        path: path.join(nuxt.options.buildDir, 'client'),
      },
      plugins: (options.config.plugins || []).some(
        (plugin: Required<UserConfig>['plugins'][number]) => {
          const pluginName = typeof plugin === 'string' ? plugin : plugin.name;
          return pluginName === '@hey-api/client-nuxt';
        },
      )
        ? []
        : ['@hey-api/client-nuxt'],
    } satisfies Partial<UserConfig>) as UserConfig;

    if (nuxt.options._prepare) {
      config.watch = false;
    }

    const folder = path.resolve(
      nuxt.options.rootDir,
      typeof config.output === 'string' ? config.output : config.output.path,
    );

    nuxt.options.alias[options.alias!] = folder;

    nuxt.hooks.hookOnce('app:templates', async () => {
      await createClient(config);
    });

    // auto-import enabled
    if (options.autoImport) {
      await createClient(config);
      const typeImports = new Set<string>();
      const valueImports = new Set<string>();
      const files = findExports(
        fs.readFileSync(path.join(folder, 'index.ts'), 'utf-8'),
      );
      for (const file of files) {
        if (!file.specifier || !/^\.{1,2}\//.test(file.specifier)) {
          continue;
        }
        const filePath = await findPath(path.resolve(folder, file.specifier));
        if (!filePath) {
          continue;
        }
        const blob = fs.readFileSync(filePath, 'utf-8');
        for (const { names } of findTypeExports(blob)) {
          for (const name of names) {
            typeImports.add(name);
          }
        }
        for (const { names } of findExports(blob)) {
          for (const name of names) {
            valueImports.add(name);
          }
        }
      }

      const imports = [
        ...[...typeImports].map((name) => ({ name, type: true })),
        ...valueImports,
      ];

      if (imports.length && options.alias) {
        addImportsSources({
          from: options.alias,
          imports,
        });
      }
    }
  },
}) as any;
