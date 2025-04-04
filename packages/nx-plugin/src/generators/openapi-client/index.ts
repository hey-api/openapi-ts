import type { Tree } from '@nx/devkit';
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  logger,
  names,
  updateJson,
  workspaceRoot,
} from '@nx/devkit';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';

import packageJson from '../../../package.json';
import type { UpdateApiExecutorSchema } from '../../executors/update-api/schema';
import {
  generateClientCode,
  generateClientCommand,
  getPackageName,
  getVersionOfPackage,
} from '../../utils';
import { CONSTANTS } from '../../vars';

const tempFolder = join(process.cwd(), 'tmp');

/**
 * Plugin configuration for the OpenAPI client generator
 */
export type ClientPluginOptions = {
  /**
   * Additional entry points to be added for this plugin to the tsconfig.base.json file
   */
  additionalEntryPoints?: string[];
  /**
   * Package.json exports to be added for this plugin to the package.json file
   */
  packageJsonExports?: Record<
    string,
    {
      default: string;
      development: string;
      import: string;
      types: string;
    }
  >;
  /**
   * Path to the template files to be added for this plugin to the project
   */
  templateFilesPath?: string;
  /**
   * Compiler paths to be added for this plugin to the tsconfig.base.json file
   */
  tsConfigCompilerPaths?: Record<string, string>;
};

const getClientPlugins = ({
  inputPlugins,
  projectName,
  projectRoot,
  projectScope,
}: NormalizedOptions & {
  inputPlugins: string[];
}): Record<string, ClientPluginOptions> => {
  const plugins: Record<string, ClientPluginOptions> = {
    '@tanstack/react-query': {
      additionalEntryPoints: [`${projectRoot}/src/rq.ts`],
      packageJsonExports: {
        './rq': {
          default: './dist/rq.js',
          development: './src/rq.ts',
          import: './dist/rq.js',
          types: './dist/rq.d.ts',
        },
      },
      templateFilesPath: './plugins/rq',
      tsConfigCompilerPaths: {
        [`${projectScope}/${projectName}/rq`]: `./${projectRoot}/src/rq.ts`,
      },
    },
  };

  // Filter the plugins that are in the inputPlugins array
  const filteredPlugins = Object.keys(plugins)
    .filter((plugin) => inputPlugins.includes(plugin))
    .reduce(
      (acc, plugin) => {
        const keyedPlugin = plugin as keyof typeof plugins;
        acc[plugin] = plugins[keyedPlugin]!;
        return acc;
      },
      {} as Record<string, ClientPluginOptions>,
    );

  return filteredPlugins;
};

export interface OpenApiClientGeneratorSchema {
  client: string;
  directory: string;
  name: string;
  plugins: string[];
  scope: string;
  spec: string;
  tags?: string;
}

export default async function (
  tree: Tree,
  options: OpenApiClientGeneratorSchema,
) {
  const normalizedOptions = normalizeOptions(options);
  const {
    clientType,
    plugins,
    projectName,
    projectRoot,
    projectScope,
    specFile,
  } = normalizedOptions;

  const clientPlugins = getClientPlugins({
    ...normalizedOptions,
    inputPlugins: plugins,
  });

  // Create the temp folder
  if (!existsSync(tempFolder)) {
    await mkdir(tempFolder);
  }

  // Generate the Nx project
  generateNxProject({
    clientPlugins,
    normalizedOptions,
    tree,
  });

  // Generate the api client code
  await generateApi({
    projectRoot,
    specFile,
    tree,
  });

  // Update the package.json file
  const installDeps = await updatePackageJson({
    clientPlugins,
    clientType,
    projectName,
    projectRoot,
    projectScope,
    tree,
  });

  // Generate the client code
  generateClientCode({
    clientType,
    outputPath: `${projectRoot}/src/generated`,
    plugins,
    specFile: `${tempFolder}/api/spec.yaml`,
  });

  // Format the files
  await formatFiles(tree);

  // Remove the temp folder
  await rm(tempFolder, { force: true, recursive: true });

  // Return a function that installs the packages
  return async () => {
    await installDeps();
    installPackagesTask(tree);
  };
}

export interface NormalizedOptions {
  clientType: string;
  plugins: string[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  specFile: string;
  tagArray: string[];
}

/**
 * Normalizes the CLI input options
 */
export function normalizeOptions(
  options: OpenApiClientGeneratorSchema,
): NormalizedOptions {
  const name = names(options.name).fileName;
  const projectDirectory = names(options.directory).fileName.replace('./', '');
  const projectName = name.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${projectDirectory}/${projectName}`;
  const tagArray = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : ['api', 'openapi'];

  return {
    clientType: options.client,
    plugins: options.plugins,
    projectDirectory,
    projectName,
    projectRoot,
    projectScope: options.scope,
    specFile: options.spec,
    tagArray,
  };
}

/**
 * Generates the nx project
 */
export function generateNxProject({
  clientPlugins,
  normalizedOptions,
  tree,
}: {
  clientPlugins: Record<string, ClientPluginOptions>;
  normalizedOptions: NormalizedOptions;
  tree: Tree;
}) {
  const {
    clientType,
    plugins,
    projectDirectory,
    projectName,
    projectRoot,
    projectScope,
    specFile,
    tagArray,
  } = normalizedOptions;

  const updateOptions: UpdateApiExecutorSchema = {
    client: clientType,
    directory: projectDirectory,
    name: projectName,
    plugins,
    scope: projectScope,
    spec: specFile,
  };

  const additionalEntryPoints: string[] = [];

  for (const plugin of plugins) {
    if (clientPlugins[plugin]) {
      additionalEntryPoints.push(
        ...(clientPlugins[plugin].additionalEntryPoints || []),
      );
    }
  }

  // Create basic project structure
  addProjectConfiguration(tree, `${projectScope}/${projectName}`, {
    projectType: 'library',
    root: projectRoot,
    sourceRoot: `${projectRoot}/src`,
    tags: tagArray,
    targets: {
      build: {
        executor: '@nx/js:tsc',
        options: {
          additionalEntryPoints,
          assets: [
            {
              glob: 'README.md',
              input: `./${projectRoot}`,
              output: '.',
            },
          ],
          main: `${projectRoot}/src/index.ts`,
          outputPath: `${projectRoot}/dist`,
          rootDir: `${projectRoot}/src`,
          tsConfig: `${projectRoot}/${CONSTANTS.TS_LIB_CONFIG_NAME}`,
        },
        outputs: ['{options.outputPath}'],
      },
      generateApi: {
        executor: 'nx:run-commands',
        options: {
          command: generateClientCommand({
            clientType,
            outputPath: `./src/${CONSTANTS.GENERATED_DIR_NAME}`,
            plugins,
            specFile: `./${CONSTANTS.SPEC_DIR_NAME}/${CONSTANTS.SPEC_FILE_NAME}`,
          }),
          cwd: projectRoot,
        },
      },
      updateApi: {
        executor: `${packageJson.name}:update-api`,
        options: updateOptions,
      },
    },
  });

  // Create directory structure
  const templatePath = join(__dirname, 'files');
  generateFiles(tree, templatePath, projectRoot, {
    ...normalizedOptions,
    clientType,
  });

  for (const plugin of plugins) {
    if (clientPlugins[plugin]) {
      if (clientPlugins[plugin].templateFilesPath) {
        const pluginTemplatePath = join(
          __dirname,
          clientPlugins[plugin].templateFilesPath,
        );
        generateFiles(tree, pluginTemplatePath, projectRoot, {
          ...normalizedOptions,
          clientType,
        });
      }

      const packageJsonExports = clientPlugins[plugin].packageJsonExports;
      if (packageJsonExports) {
        updateJson(tree, `${projectRoot}/package.json`, (json) => {
          json.exports = {
            ...json.exports,
            ...packageJsonExports,
          };
          return json;
        });
      }
    }
  }
}

/**
 * Generates the api client code using the spec file
 */
export async function generateApi({
  projectRoot,
  specFile,
  tree,
}: {
  projectRoot: string;
  specFile: string;
  tree: Tree;
}) {
  // Create api directory if it doesn't exist
  const apiDirectory = joinPathFragments(projectRoot, CONSTANTS.SPEC_DIR_NAME);

  // Determine spec file paths
  const specDestination = joinPathFragments(
    apiDirectory,
    CONSTANTS.SPEC_FILE_NAME,
  );
  const tempSpecDestination = joinPathFragments(
    tempFolder,
    CONSTANTS.SPEC_DIR_NAME,
    CONSTANTS.SPEC_FILE_NAME,
  );

  try {
    // Create a full file path for the temporary and final spec files
    const workspacePath = process.cwd();
    const fullSpecPath = join(workspacePath, specDestination);

    logger.info(`Full spec path: ${fullSpecPath}`);

    try {
      // Ensure the directories exist in the actual file system for redocly to work with
      tree.write(specDestination, ''); // Just to ensure the directory exists

      // Bundle the spec file using Redocly CLI
      logger.info(`Bundling OpenAPI spec file using Redocly CLI...`);
      // Copy bundled and dereferenced spec file to project
      execSync(
        `npx redocly bundle ${specFile} --output ${tempSpecDestination} --ext yaml --dereferenced`,
        {
          stdio: 'inherit',
        },
      );
      logger.info(`OpenAPI spec file bundled successfully.`);

      // Read the bundled file back into the tree
      if (existsSync(tempSpecDestination)) {
        const bundledContent = await readFile(tempSpecDestination, 'utf-8');
        tree.write(specDestination, bundledContent);
      } else {
        throw new Error('Failed to find bundled spec file');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to bundle OpenAPI spec: ${errorMessage}`);
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error processing spec file: ${errorMessage}`);
  }
}

/**
 * Updates the package.json file to add dependencies and scripts
 */
export async function updatePackageJson({
  clientPlugins,
  clientType,
  projectName,
  projectRoot,
  projectScope,
  tree,
}: {
  clientPlugins: Record<string, ClientPluginOptions>;
  clientType: string;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  tree: Tree;
}) {
  const { default: latestVersion } = await import('latest-version');
  const packageName = getPackageName(clientType);
  const packageVersion =
    getVersionOfPackage(clientType) || `^${await latestVersion(packageName)}`;

  const latestOpenApiTsVersion = `^${await latestVersion(
    '@hey-api/openapi-ts',
  )}`;

  // Update package.json to add dependencies and scripts
  const deps: Record<string, string> = {
    '@hey-api/openapi-ts': latestOpenApiTsVersion,
    [packageName]: packageVersion,
  };

  if (packageName === '@hey-api/client-axios') {
    const axiosVersion = await latestVersion('axios');
    deps['axios'] = `^${axiosVersion}`;
  }

  const installDeps = addDependenciesToPackageJson(
    tree,
    deps,
    {},
    join(projectRoot, 'package.json'),
  );

  const tsconfigName = 'tsconfig.base.json';
  const tsConfigPath = join(workspaceRoot, tsconfigName);
  if (existsSync(tsConfigPath)) {
    updateJson(tree, tsconfigName, (json) => {
      const paths = json.compilerOptions.paths || {};
      paths[`${projectScope}/${projectName}`] = [
        `./${projectRoot}/src/index.ts`,
      ];
      for (const plugin of Object.keys(clientPlugins)) {
        const item = clientPlugins[plugin]!;
        const pluginTsConfigPath = item.tsConfigCompilerPaths;
        if (pluginTsConfigPath) {
          // for each key in the pluginTsConfigPath object, add it to the paths object
          for (const [key, value] of Object.entries(pluginTsConfigPath)) {
            paths[key] = [value];
          }
        }
      }
      json.compilerOptions.paths = paths;
      return json;
    });
  } else {
    logger.error(`Failed to find ${tsconfigName} file in ${workspaceRoot}.`);
    throw new Error(`Failed to find ${tsconfigName} file in ${workspaceRoot}.`);
  }

  return installDeps;
}
