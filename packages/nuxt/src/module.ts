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
  async setup(options: ModuleOptions) {
    const nuxt = useNuxt();

    const config = defu(options.config, {
      output: {
        path: path.join(nuxt.options.rootDir, '.nuxt', 'heyapi', 'client'),
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

    const serverPlugins = (options.config.plugins || []).filter(
      (plugin: Required<UserConfig>['plugins'][number]) => {
        const pluginName = typeof plugin === 'string' ? plugin : plugin.name;
        return pluginName !== '@hey-api/client-nuxt';
      },
    );
    if (
      !serverPlugins.some(
        (p: any) => (typeof p === 'string' ? p : p.name) === '@hey-api/client-ofetch',
      )
    ) {
      serverPlugins.push('@hey-api/client-ofetch');
    }

    const serverConfig: UserConfig = {
      ...options.config,
      output: {
        ...(typeof options.config.output === 'object' &&
        options.config.output !== null &&
        !Array.isArray(options.config.output)
          ? options.config.output
          : {}),
        path: path.join(nuxt.options.rootDir, '.nuxt', 'heyapi', 'nitroClient'),
      },
      plugins: serverPlugins,
    };

    if (nuxt.options._prepare) {
      config.watch = false;
      serverConfig.watch = false;
    }

    const output = config.output instanceof Array ? config.output[0] : config.output;
    const folder = path.resolve(
      nuxt.options.rootDir,
      typeof output === 'string' ? output : (output?.path ?? ''),
    );

    const serverOutput =
      serverConfig.output instanceof Array ? serverConfig.output[0] : serverConfig.output;
    const serverFolder = path.resolve(
      nuxt.options.rootDir,
      typeof serverOutput === 'string' ? serverOutput : (serverOutput?.path ?? ''),
    );

    nuxt.options.alias[options.alias!] = folder;

    nuxt.options.nitro = nuxt.options.nitro || {};
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {};
    nuxt.options.nitro.alias[options.alias!] = serverFolder;

    nuxt.options.build.transpile.push(folder, serverFolder, options.alias!);
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {};
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || [];
    nuxt.options.nitro.externals.inline.push(folder, serverFolder, options.alias!);

    nuxt.hooks.hookOnce('app:templates', async () => {
      await Promise.all([createClient(config), createClient(serverConfig)]);
    });

    // auto-import enabled
    if (options.autoImport) {
      await Promise.all([createClient(config), createClient(serverConfig)]);
      const typeImports = new Set<string>();
      const valueImports = new Set<string>();
      const files = findExports(fs.readFileSync(path.join(folder, 'index.ts'), 'utf-8'));
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

      const typeImportsArray = [...typeImports].map((name) => ({ name, type: true }));
      const imports = [...typeImportsArray, ...valueImports];

      if (imports.length && options.alias) {
        addImportsSources({
          from: options.alias,
          imports,
        });

        nuxt.options.nitro.imports = nuxt.options.nitro.imports || {};
        nuxt.options.nitro.imports.imports = nuxt.options.nitro.imports.imports || [];
        nuxt.options.nitro.imports.imports.push(
          ...typeImportsArray.map((i) => ({
            from: options.alias!,
            name: i.name,
            type: true,
          })),
          ...[...valueImports].map((name) => ({
            from: options.alias!,
            name,
          })),
        );
      }
    }
  },
}) as any;
