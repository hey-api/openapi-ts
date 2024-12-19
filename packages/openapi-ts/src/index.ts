import fs from 'node:fs';
import path from 'node:path';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { loadConfig } from 'c12';
import { sync } from 'cross-spawn';

import { generateLegacyOutput, generateOutput } from './generate/output';
import { ensureDirSync } from './generate/utils';
import type { IR } from './ir/types';
import { parseExperimental, parseLegacy } from './openApi';
import type { ClientPlugins, UserPlugins } from './plugins';
import { defaultPluginConfigs } from './plugins';
import type {
  AnyPluginName,
  DefaultPluginConfigs,
  PluginContext,
  PluginNames,
} from './plugins/types';
import type { Client } from './types/client';
import type {
  ClientConfig,
  Config,
  Formatters,
  Linters,
  UserConfig,
} from './types/config';
import { CLIENTS } from './types/config';
import {
  isLegacyClient,
  legacyNameFromConfig,
  setConfig,
} from './utils/config';
import { registerHandlebarTemplates } from './utils/handlebars';
import { Performance, PerformanceReport } from './utils/performance';
import { postProcessClient } from './utils/postprocess';

type OutputProcessor = {
  args: (path: string) => ReadonlyArray<string>;
  command: string;
  name: string;
};

/**
 * Map of supported formatters
 */
const formatters: Record<Formatters, OutputProcessor> = {
  biome: {
    args: (path) => ['format', '--write', path],
    command: 'biome',
    name: 'Biome (Format)',
  },
  prettier: {
    args: (path) => [
      '--ignore-unknown',
      path,
      '--write',
      '--ignore-path',
      './.prettierignore',
    ],
    command: 'prettier',
    name: 'Prettier',
  },
};

/**
 * Map of supported linters
 */
const linters: Record<Linters, OutputProcessor> = {
  biome: {
    args: (path) => ['lint', '--apply', path],
    command: 'biome',
    name: 'Biome (Lint)',
  },
  eslint: {
    args: (path) => [path, '--fix'],
    command: 'eslint',
    name: 'ESLint',
  },
  oxlint: {
    args: (path) => ['--fix', path],
    command: 'oxlint',
    name: 'oxlint',
  },
};

const processOutput = ({ config }: { config: Config }) => {
  if (config.output.format) {
    const module = formatters[config.output.format];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }

  if (config.output.lint) {
    const module = linters[config.output.lint];
    console.log(`✨ Running ${module.name}`);
    sync(module.command, module.args(config.output.path));
  }
};

const logClientMessage = ({ config }: { config: Config }) => {
  switch (config.client.name) {
    case 'legacy/angular':
      return console.log('✨ Creating Angular client');
    case '@hey-api/client-axios':
    case 'legacy/axios':
      return console.log('✨ Creating Axios client');
    case '@hey-api/client-fetch':
    case 'legacy/fetch':
      return console.log('✨ Creating Fetch client');
    case 'legacy/node':
      return console.log('✨ Creating Node.js client');
    case 'legacy/xhr':
      return console.log('✨ Creating XHR client');
  }
};

const getClient = (userConfig: ClientConfig): Config['client'] => {
  let client: Config['client'] = {
    bundle: false,
    name: '' as Config['client']['name'],
  };
  if (typeof userConfig.client === 'string') {
    client.name = userConfig.client;
  } else if (userConfig.client) {
    client = {
      ...client,
      ...userConfig.client,
    };
  }
  return client;
};

const getInput = (userConfig: ClientConfig): Config['input'] => {
  let input: Config['input'] = {
    path: '',
  };
  if (typeof userConfig.input === 'string') {
    input.path = userConfig.input;
  } else if (userConfig.input && userConfig.input.path) {
    input = {
      ...input,
      ...userConfig.input,
    };
  } else {
    input = {
      ...input,
      path: userConfig.input,
    };
  }
  return input;
};

const getLogs = (userConfig: ClientConfig): Config['logs'] => {
  let logs: Config['logs'] = {
    level: 'info',
    path: process.cwd(),
  };
  if (typeof userConfig.logs === 'string') {
    logs.path = userConfig.logs;
  } else {
    logs = {
      ...logs,
      ...userConfig.logs,
    };
  }
  return logs;
};

const getOutput = (userConfig: ClientConfig): Config['output'] => {
  let output: Config['output'] = {
    clean: true,
    format: false,
    lint: false,
    path: '',
  };
  if (typeof userConfig.output === 'string') {
    output.path = userConfig.output;
  } else {
    output = {
      ...output,
      ...userConfig.output,
    };
  }
  return output;
};

const getPluginsConfig = ({
  pluginConfigs,
  userPlugins,
  userPluginsConfig,
}: {
  pluginConfigs: DefaultPluginConfigs<ClientPlugins>;
  userPlugins: ReadonlyArray<AnyPluginName>;
  userPluginsConfig: Config['plugins'];
}): Pick<Config, 'plugins' | 'pluginOrder'> => {
  const circularReferenceTracker = new Set<AnyPluginName>();
  const pluginOrder = new Set<AnyPluginName>();
  const plugins: Config['plugins'] = {};

  const dfs = (name: AnyPluginName) => {
    if (circularReferenceTracker.has(name)) {
      throw new Error(`Circular reference detected at '${name}'`);
    }

    if (!pluginOrder.has(name)) {
      circularReferenceTracker.add(name);

      const pluginConfig = pluginConfigs[name as PluginNames];
      if (!pluginConfig) {
        throw new Error(
          `🚫 unknown plugin dependency "${name}" - do you need to register a custom plugin with this name?`,
        );
      }

      const defaultOptions = defaultPluginConfigs[name as PluginNames];
      const userOptions = userPluginsConfig[name as PluginNames];
      if (userOptions && defaultOptions) {
        const nativePluginOption = Object.keys(userOptions).find((key) =>
          key.startsWith('_'),
        );
        if (nativePluginOption) {
          throw new Error(
            `🚫 cannot register plugin "${name}" - attempting to override a native plugin option "${nativePluginOption}"`,
          );
        }
      }

      const config = {
        _dependencies: [],
        ...defaultOptions,
        ...userOptions,
      };

      if (config._infer) {
        const context: PluginContext = {
          ensureDependency: (dependency) => {
            if (
              typeof dependency === 'string' &&
              !config._dependencies.includes(dependency)
            ) {
              config._dependencies = [...config._dependencies, dependency];
            }
          },
          pluginByTag: (tag) => {
            for (const userPlugin of userPlugins) {
              const defaultConfig =
                defaultPluginConfigs[userPlugin as PluginNames];
              if (
                defaultConfig &&
                defaultConfig._tags?.includes(tag) &&
                userPlugin !== name
              ) {
                return userPlugin;
              }
            }
          },
        };
        config._infer(config, context);
      }

      for (const dependency of config._dependencies) {
        dfs(dependency);
      }

      circularReferenceTracker.delete(name);
      pluginOrder.add(name);

      // @ts-expect-error
      plugins[name] = config;
    }
  };

  for (const name of userPlugins) {
    dfs(name);
  }

  return {
    pluginOrder: Array.from(pluginOrder) as ReadonlyArray<PluginNames>,
    plugins,
  };
};

const getPlugins = (
  userConfig: ClientConfig,
): Pick<Config, 'plugins' | 'pluginOrder'> => {
  const userPluginsConfig: Config['plugins'] = {};

  const userPlugins = (userConfig.plugins ?? defaultPlugins)
    .map((plugin) => {
      if (typeof plugin === 'string') {
        return plugin;
      }

      if (plugin.name) {
        // @ts-expect-error
        userPluginsConfig[plugin.name] = plugin;
      }

      return plugin.name;
    })
    .filter(Boolean);

  return getPluginsConfig({
    pluginConfigs: {
      ...userPluginsConfig,
      ...defaultPluginConfigs,
    },
    userPlugins,
    userPluginsConfig,
  });
};

const getSpec = async ({ config }: { config: Config }) => {
  let spec: unknown = config.input.path;

  if (typeof config.input.path === 'string') {
    const absolutePathOrUrl = fs.existsSync(config.input.path)
      ? path.resolve(config.input.path)
      : config.input.path;
    spec = await $RefParser.bundle(absolutePathOrUrl);
  }

  return spec;
};

const initConfigs = async (userConfig: UserConfig): Promise<Config[]> => {
  let configurationFile: string | undefined = undefined;
  if (userConfig.configFile) {
    const parts = userConfig.configFile.split('.');
    configurationFile = parts.slice(0, parts.length - 1).join('.');
  }

  const { config: configFromFile } = await loadConfig<UserConfig>({
    configFile: configurationFile,
    name: 'openapi-ts',
  });

  const userConfigs: ClientConfig[] = Array.isArray(userConfig)
    ? userConfig
    : Array.isArray(configFromFile)
      ? configFromFile.map((config) => ({
          ...config,
          ...userConfig,
        }))
      : [{ ...(configFromFile ?? {}), ...userConfig }];

  return userConfigs.map((userConfig) => {
    const {
      base,
      configFile = '',
      dryRun = false,
      experimentalParser = false,
      exportCore = true,
      name,
      request,
      useOptions = true,
    } = userConfig;

    const logs = getLogs(userConfig);

    if (logs.level === 'debug') {
      console.warn('userConfig:', userConfig);
    }

    const input = getInput(userConfig);
    const output = getOutput(userConfig);

    if (!input.path) {
      throw new Error(
        '🚫 missing input - which OpenAPI specification should we use to generate your client?',
      );
    }

    if (!output.path) {
      throw new Error(
        '🚫 missing output - where should we generate your client?',
      );
    }

    const client = getClient(userConfig);

    if (client.name && !CLIENTS.includes(client.name)) {
      throw new Error('🚫 invalid client - select a valid client value');
    }

    if (!useOptions) {
      console.warn(
        '❗️ Deprecation warning: useOptions set to false. This setting will be removed in future versions. Please migrate useOptions to true https://heyapi.dev/openapi-ts/migrating.html#v0-27-38',
      );
    }

    output.path = path.resolve(process.cwd(), output.path);

    const config = setConfig({
      ...getPlugins(userConfig),
      base,
      client,
      configFile,
      dryRun,
      experimentalParser,
      exportCore: isLegacyClient(client) ? exportCore : false,
      input,
      logs,
      name,
      output,
      request,
      useOptions,
    });

    if (logs.level === 'debug') {
      console.warn('config:', config);
    }

    return config;
  });
};

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param userConfig {@link UserConfig} passed to the `createClient()` method
 */
export async function createClient(
  userConfig: UserConfig,
): Promise<ReadonlyArray<Client>> {
  let configs: Config[] = [];

  try {
    Performance.start('createClient');

    Performance.start('config');
    configs = await initConfigs(userConfig);
    Performance.end('config');

    Performance.start('handlebars');
    const templates = registerHandlebarTemplates();
    Performance.end('handlebars');

    const pCreateClient = (config: Config) => async () => {
      Performance.start('spec');
      const spec = await getSpec({ config });
      Performance.end('spec');

      let client: Client | undefined;
      let context: IR.Context | undefined;

      Performance.start('parser');
      if (
        config.experimentalParser &&
        !isLegacyClient(config) &&
        !legacyNameFromConfig(config)
      ) {
        context = parseExperimental({ config, spec });
      }

      // fallback to legacy parser
      if (!context) {
        const parsed = parseLegacy({ openApi: spec });
        client = postProcessClient(parsed);
      }
      Performance.end('parser');

      logClientMessage({ config });

      Performance.start('generator');
      if (context) {
        await generateOutput({ context });
      } else if (client) {
        await generateLegacyOutput({ client, openApi: spec, templates });
      }
      Performance.end('generator');

      Performance.start('postprocess');
      if (!config.dryRun) {
        processOutput({ config });

        console.log('✨ Done! Your client is located in:', config.output.path);
      }
      Performance.end('postprocess');

      return context || client;
    };

    const clients: Array<Client> = [];

    const pClients = configs.map((config) => pCreateClient(config));
    for (const pClient of pClients) {
      const client = await pClient();
      if (client && 'version' in client) {
        clients.push(client);
      }
    }

    Performance.end('createClient');

    if (configs[0].logs.level === 'debug') {
      const perfReport = new PerformanceReport({
        totalMark: 'createClient',
      });
      perfReport.report({
        marks: [
          'config',
          'openapi',
          'handlebars',
          'parser',
          'generator',
          'postprocess',
        ],
      });
    }

    return clients;
  } catch (error) {
    const config = configs[0] as Config | undefined;
    const dryRun = config ? config.dryRun : userConfig?.dryRun;
    // TODO: add setting for log output
    if (!dryRun) {
      const logs = config?.logs ?? getLogs(userConfig);
      if (logs.level !== 'silent') {
        const logName = `openapi-ts-error-${Date.now()}.log`;
        const logsDir = path.resolve(process.cwd(), logs.path ?? '');
        ensureDirSync(logsDir);
        const logPath = path.resolve(logsDir, logName);
        fs.writeFileSync(logPath, `${error.message}\n${error.stack}`);
        console.error(`🔥 Unexpected error occurred. Log saved to ${logPath}`);
      }
    }
    console.error(`🔥 Unexpected error occurred. ${error.message}`);
    throw error;
  }
}

/**
 * Default plugins used to generate artifacts if plugins aren't specified.
 */
export const defaultPlugins = [
  '@hey-api/typescript',
  '@hey-api/sdk',
] as const satisfies ReadonlyArray<UserPlugins['name']>;

/**
 * Type helper for openapi-ts.config.ts, returns {@link UserConfig} object
 */
export const defineConfig = (config: UserConfig): UserConfig => config;

export type { IR } from './ir/types';
export type { OpenApi } from './openApi/types';
export type { Plugin } from './plugins/types';
export type { UserConfig } from './types/config';
export type { LegacyIR } from './types/types';
export { utils } from './utils/exports';
