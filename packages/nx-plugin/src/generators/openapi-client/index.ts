import { existsSync, writeFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { ProjectConfiguration, Tree } from '@nx/devkit';
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
} from '@nx/devkit';

import packageJson from '../../../package.json';
import type { UpdateApiExecutorSchema } from '../../executors/update-api/schema';
import {
  bundleAndDereferenceSpecFile,
  generateClientCode,
  generateClientCommand,
  getPackageName,
  getVersionOfPackage,
  isAFile,
  isUrl,
} from '../../utils';
import { CONSTANTS } from '../../vars';

const defaultTempFolder = join(process.cwd(), CONSTANTS.TMP_DIR_NAME);

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
      additionalEntryPoints: [`{projectRoot}/src/rq.ts`],
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
        const foundPlugin = plugins[keyedPlugin];
        if (!foundPlugin) {
          return acc;
        }
        acc[plugin] = foundPlugin;

        return acc;
      },
      {} as Record<string, ClientPluginOptions>,
    );

  return filteredPlugins;
};

// add additional test runners to support here
/**
 * The test runner to use
 */
export type TestRunner = 'vitest';

/**
 * The test runners and their configurations for generating test files
 */
const testRunners: Record<
  TestRunner,
  {
    /**
     * The template path to the test files
     */
    templatePath: string;
  }
> = {
  vitest: {
    templatePath: './tests/vitest',
  },
};

export interface OpenApiClientGeneratorSchema {
  /**
   * The client to use for the OpenAPI client
   */
  client: string;
  /**
   * The directory to use for the project
   */
  directory: string;
  /**
   * The name of the project
   */
  name: string;
  /**
   * The plugins to use for the OpenAPI client
   */
  plugins: string[];
  /**
   * The scope of the project
   */
  scope: string;
  /**
   * The spec file to use for the OpenAPI client
   */
  spec: string;
  /**
   * The tags to use for the project
   */
  tags?: string[];
  /**
   * The directory to use for the temp folder, defaults to `./tmp`
   * Only used for testing purposes
   */
  tempFolderDir?: string;
  /**
   * The test runner to use for the project, defaults to `none`
   */
  test?: TestRunner | 'none';
}

export default async function (
  tree: Tree,
  options: OpenApiClientGeneratorSchema,
) {
  logger.info(
    `Starting OpenAPI client generator with options: ${JSON.stringify(options, null, 2)}`,
  );
  try {
    const normalizedOptions = normalizeOptions(options);
    logger.debug(
      `Normalized options: ${JSON.stringify(normalizedOptions, null, 2)}`,
    );

    const {
      clientType,
      plugins,
      projectName,
      projectRoot,
      projectScope,
      specFile,
      tempFolder,
    } = normalizedOptions;

    logger.info(
      `Generating OpenAPI client for '${projectName}' using client type '${clientType}'`,
    );
    logger.debug(`Using plugins: ${plugins.join(', ')}`);

    const clientPlugins = getClientPlugins({
      ...normalizedOptions,
      inputPlugins: plugins,
    });
    logger.debug(`Found ${Object.keys(clientPlugins).length} client plugins`);

    // Create the temp folder
    if (!existsSync(tempFolder)) {
      logger.debug(`Creating temp folder: ${tempFolder}`);
      await mkdir(tempFolder);
    } else {
      logger.debug(`Temp folder already exists: ${tempFolder}`);
    }

    // Generate the Nx project
    logger.info(`Generating Nx project structure`);
    generateNxProject({
      clientPlugins,
      normalizedOptions,
      tree,
    });

    // Generate the api client code
    logger.info(`Generating API client code using spec file: ${specFile}`);
    await generateApi({
      client: clientType,
      plugins,
      projectRoot,
      specFile,
      tempFolder,
      tree,
    });

    // Update the package.json file
    logger.info(`Updating package.json with dependencies`);
    const installDeps = await updatePackageJson({
      clientType,
      projectRoot,
      tree,
    });

    // Update the tsconfig.base.json file
    logger.info(`Updating tsconfig.base.json with project paths`);
    updateTsConfig({
      clientPlugins,
      projectName,
      projectRoot,
      projectScope,
      tree,
    });

    // Generate the client code
    logger.info(`Generating client code from spec file`);
    await generateClientCode({
      clientType,
      outputPath: `${projectRoot}/src/${CONSTANTS.GENERATED_DIR_NAME}`,
      plugins,
      specFile: `${tempFolder}/${CONSTANTS.SPEC_DIR_NAME}/${CONSTANTS.SPEC_FILE_NAME}`,
    });

    // Format the files
    logger.debug(`Formatting generated files`);
    await formatFiles(tree);

    // Remove the temp folder
    const absoluteTempFolder = join(process.cwd(), tempFolder);
    logger.debug(`Removing temp folder: ${absoluteTempFolder}`);
    await rm(absoluteTempFolder, { force: true, recursive: true });

    logger.info(
      `OpenAPI client generator completed successfully for ${projectName}`,
    );
    // Return a function that installs the packages
    return async () => {
      logger.info(`Installing dependencies for ${projectName}`);
      await installDeps();
      installPackagesTask(tree);
      logger.info(`Dependencies installed successfully`);
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`OpenAPI client generator failed: ${errorMessage}`);
    throw error;
  }
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
  tempFolder: string;
  test: TestRunner | 'none';
}

export type GeneratedOptions = NormalizedOptions & typeof CONSTANTS;

type ProjectConfigurationTargets = NonNullable<ProjectConfiguration['targets']>;
type ValueType<T extends Record<string, any>> = T[keyof T];

type Input = NonNullable<
  ValueType<ProjectConfigurationTargets>['inputs']
>[number];
type Output = NonNullable<
  ValueType<ProjectConfigurationTargets>['outputs']
>[number];

/**
 * Normalizes the CLI input options
 */
export function normalizeOptions(
  options: OpenApiClientGeneratorSchema,
): NormalizedOptions {
  logger.debug(`Normalizing options: ${JSON.stringify(options, null, 2)}`);

  const name = names(options.name).fileName;
  logger.debug(`Normalized name: ${name}`);

  const projectDirectory = names(options.directory).fileName.replace('./', '');
  logger.debug(`Normalized project directory: ${projectDirectory}`);

  const projectName = name.replace(new RegExp('/', 'g'), '-');
  logger.debug(`Normalized project name: ${projectName}`);

  const projectRoot = `${projectDirectory}/${projectName}`;
  logger.debug(`Project root path: ${projectRoot}`);

  const tagArray = Array.from(
    new Set(
      (typeof options.tags === 'string'
        ? (options.tags as string).split(',')
        : (options.tags ?? [])
      ).map((s) => s.trim()),
    ),
  );
  logger.debug(`Tag array: ${tagArray.join(', ')}`);

  const tempFolder = options.tempFolderDir ?? defaultTempFolder;
  logger.debug(`Temp folder path: ${tempFolder}`);

  return {
    clientType: options.client,
    plugins: options.plugins,
    projectDirectory,
    projectName,
    projectRoot,
    projectScope: options.scope,
    specFile: options.spec,
    tagArray,
    tempFolder,
    test: options.test ?? 'none',
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
  logger.debug(`Generating Nx project...`);
  const {
    clientType,
    plugins,
    projectDirectory,
    projectName,
    projectRoot,
    projectScope,
    specFile,
    tagArray,
    test,
  } = normalizedOptions;

  logger.debug(
    `Project configuration: scope=${projectScope}, name=${projectName}, root=${projectRoot}`,
  );

  const updateOptions: UpdateApiExecutorSchema = {
    client: clientType,
    directory: projectDirectory,
    name: projectName,
    plugins,
    scope: projectScope,
    spec: specFile,
  };
  logger.debug(
    `Update API executor options: ${JSON.stringify(updateOptions, null, 2)}`,
  );

  const specIsAFile = isAFile(specFile);
  const specIsRemote = isUrl(specFile);
  logger.debug(
    `Spec file type: isFile=${specIsAFile}, isRemote=${specIsRemote}`,
  );

  const additionalEntryPoints: string[] = [];

  for (const plugin of plugins) {
    const clientPlugin = clientPlugins[plugin];
    if (clientPlugin) {
      logger.debug(`Adding entry points for plugin: ${plugin}`);
      additionalEntryPoints.push(...(clientPlugin.additionalEntryPoints ?? []));
    }
  }
  logger.debug(`Additional entry points: ${additionalEntryPoints.join(', ')}`);

  const baseInputs: Input[] = [
    `{projectRoot}/${CONSTANTS.SPEC_DIR_NAME}`,
    '{projectRoot}/package.json',
    '{projectRoot}/tsconfig.json',
    '{projectRoot}/tsconfig.lib.json',
    '{projectRoot}/openapi-ts.config.ts',
  ];
  logger.debug(`Base inputs: ${baseInputs.join(', ')}`);

  const updateInputs: Input[] = [...baseInputs];

  if (specIsAFile) {
    // if the spec file is a file then we need to add it to inputs so that it is watched by NX
    logger.debug(`Adding local spec file to inputs: ${specFile}`);
    updateInputs.push(specFile);
  } else if (specIsRemote) {
    // here we should add a hash of the spec file to the inputs so that NX will watch for changes
    // fetch the spec file from url and get the hash
    logger.debug(`Adding remote spec file hash to inputs for URL: ${specFile}`);
    const apiHash: Input = {
      runtime: `npx node -e "console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "$(npx -y xcurl -s ${specFile})"`,
    };
    updateInputs.push(apiHash);
  } else {
    logger.error(`Spec file ${specFile} is not a file or valid URI.`);
    throw new Error(`Spec file ${specFile} is not a file or valid URI.`);
  }

  const generateOutputs: Output[] = ['{options.outputPath}'];
  const generateOutputPath = `./src/${CONSTANTS.GENERATED_DIR_NAME}`;
  logger.debug(
    `Generate outputs: ${JSON.stringify(generateOutputs)}, output path: ${generateOutputPath}`,
  );

  logger.info(
    `Adding project configuration for ${projectScope}/${projectName}`,
  );
  // Create basic project structure
  addProjectConfiguration(tree, `${projectScope}/${projectName}`, {
    projectType: 'library',
    root: projectRoot,
    sourceRoot: `{projectRoot}/src`,
    tags: tagArray,
    targets: {
      build: {
        dependsOn: ['updateApi'],
        executor: '@nx/js:tsc',
        inputs: [
          { dependentTasksOutputFiles: '**/*.ts' },
          '^build',
          ...baseInputs,
        ],
        options: {
          additionalEntryPoints,
          assets: [
            {
              glob: 'README.md',
              input: `./{projectRoot}`,
              output: '.',
            },
          ],
          main: `{projectRoot}/src/index.ts`,
          outputPath: `{projectRoot}/dist`,
          rootDir: `{projectRoot}/src`,
          tsConfig: `{projectRoot}/${CONSTANTS.TS_LIB_CONFIG_NAME}`,
        },
        outputs: ['{projectRoot}/dist'],
      },
      generateApi: {
        executor: 'nx:run-commands',
        inputs: baseInputs,
        options: {
          command: generateClientCommand({
            clientType,
            outputPath: generateOutputPath,
            plugins,
            specFile: `./${CONSTANTS.SPEC_DIR_NAME}/${CONSTANTS.SPEC_FILE_NAME}`,
          }),
          cwd: `{projectRoot}`,
          outputPath: generateOutputPath,
        },
        outputs: generateOutputs,
      },
      // this adds the update-api executor to the generated project
      updateApi: {
        cache: true,
        executor: `${packageJson.name}:update-api`,
        inputs: updateInputs,
        options: updateOptions,
        outputs: [
          `{projectRoot}/src/${CONSTANTS.GENERATED_DIR_NAME}`,
          `{projectRoot}/${CONSTANTS.SPEC_DIR_NAME}`,
        ],
      },
    },
  });

  const generatedOptions: GeneratedOptions = {
    ...normalizedOptions,
    ...CONSTANTS,
  };
  logger.debug(`Generated options created with constants`);

  // Create directory structure
  const templatePath = join(__dirname, 'files');
  logger.info(`Generating files from template: ${templatePath}`);
  generateFiles(tree, templatePath, projectRoot, generatedOptions);

  for (const plugin of plugins) {
    const pluginConfig = clientPlugins[plugin];
    if (pluginConfig) {
      logger.info(`Handling plugin: ${plugin}`);
      handlePlugin({
        generatedOptions,
        plugin: pluginConfig,
        projectRoot,
        tree,
      });
    }
  }

  // Generate the test files
  if (test !== 'none') {
    logger.info(`Generating test files using test runner: ${test}`);
    generateTestFiles({
      generatedOptions,
      projectRoot,
      test,
      tree,
    });
  } else {
    logger.debug(`No test runner specified, skipping test files generation`);
  }
  logger.debug(`Nx project generated successfully.`);
}

function handlePlugin({
  generatedOptions,
  plugin,
  projectRoot,
  tree,
}: {
  generatedOptions: GeneratedOptions;
  plugin: ClientPluginOptions;
  projectRoot: string;
  tree: Tree;
}) {
  logger.debug(
    `Handling plugin with options: ${JSON.stringify(plugin, null, 2)}`,
  );

  if (plugin.templateFilesPath) {
    const pluginTemplatePath = join(__dirname, plugin.templateFilesPath);
    logger.debug(
      `Generating files from plugin template: ${pluginTemplatePath}`,
    );
    generateFiles(tree, pluginTemplatePath, projectRoot, generatedOptions);
  }

  const packageJsonExports = plugin.packageJsonExports;
  if (packageJsonExports) {
    logger.debug(
      `Updating package.json exports for plugin: ${JSON.stringify(packageJsonExports, null, 2)}`,
    );
    updateJson(tree, `${projectRoot}/package.json`, (json) => {
      json.exports = {
        ...json.exports,
        ...packageJsonExports,
      };
      return json;
    });
  }
}

export function generateTestFiles({
  generatedOptions,
  projectRoot,
  test,
  tree,
}: {
  generatedOptions: GeneratedOptions;
  projectRoot: string;
  test: TestRunner;
  tree: Tree;
}) {
  logger.debug(`Generating test files for test runner: ${test}`);

  // link the tsconfig.spec.json to the tsconfig.json
  logger.debug(`Updating tsconfig.json to include spec config reference`);
  updateJson(tree, `${projectRoot}/tsconfig.json`, (json) => {
    json.references = [
      ...(json.references ?? []),
      {
        path: `./${CONSTANTS.TS_SPEC_CONFIG_NAME}`,
      },
    ];
    return json;
  });

  const { templatePath } = testRunners[test];
  logger.debug(`Using test template path: ${templatePath}`);
  generateFiles(
    tree,
    join(__dirname, templatePath),
    projectRoot,
    generatedOptions,
  );
  logger.debug(`Test files generated successfully`);
}

/**
 * Generates the api client code using the spec file
 */
export async function generateApi({
  client,
  plugins,
  projectRoot,
  specFile,
  tempFolder,
  tree,
}: {
  client: string;
  plugins: string[];
  projectRoot: string;
  specFile: string;
  tempFolder: string;
  tree: Tree;
}) {
  logger.info(`Generating API client code from spec: ${specFile}`);
  logger.debug(`Client: ${client}, Plugins: ${plugins.join(', ')}`);

  // Create api directory if it doesn't exist
  const apiDirectory = joinPathFragments(projectRoot, CONSTANTS.SPEC_DIR_NAME);
  logger.debug(`API directory: ${apiDirectory}`);

  // Determine spec file paths
  const specDestination = joinPathFragments(
    apiDirectory,
    CONSTANTS.SPEC_FILE_NAME,
  );
  logger.debug(`Spec destination in tree: ${specDestination}`);

  const tempSpecFolder = joinPathFragments(tempFolder, CONSTANTS.SPEC_DIR_NAME);
  logger.debug(`Temp spec folder: ${tempSpecFolder}`);

  // Create a full file path for the temp spec files
  const tempSpecDestination = joinPathFragments(
    tempSpecFolder,
    CONSTANTS.SPEC_FILE_NAME,
  );
  logger.debug(`Temp spec destination: ${tempSpecDestination}`);

  try {
    const absoluteTempSpecDestination = join(
      process.cwd(),
      tempSpecDestination,
    );
    logger.debug(
      `Absolute temp spec destination: ${absoluteTempSpecDestination}`,
    );

    // Ensure the directories exist in the tree file system
    logger.debug(`Creating empty spec destination file in tree`);
    tree.write(specDestination, '');

    logger.info(`Bundling and dereferencing spec file: ${specFile}`);
    const dereferencedSpec = await bundleAndDereferenceSpecFile({
      client,
      outputPath: absoluteTempSpecDestination,
      plugins,
      specPath: specFile,
    });
    logger.info(`OpenAPI spec file bundled successfully.`);

    const dereferencedSpecString = JSON.stringify(dereferencedSpec, null, 2);
    const absoluteSpecDestination = join(process.cwd(), tempSpecFolder);
    logger.debug(`Absolute spec destination: ${absoluteSpecDestination}`);

    // Read the bundled file back into the tree
    if (dereferencedSpec) {
      try {
        logger.debug(
          `Writing dereferenced spec to temp file ${absoluteTempSpecDestination}...`,
        );
        // write to temp spec destination
        await mkdir(absoluteSpecDestination, { recursive: true });
        writeFileSync(absoluteTempSpecDestination, dereferencedSpecString);
        logger.debug(`Spec file written to temp location successfully`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(
          `Failed to write dereferenced spec to temp file: ${errorMessage}.`,
        );
        throw error;
      }
      // write to to destination in the tree
      logger.debug(`Writing spec file to tree at: ${specDestination}`);
      tree.write(specDestination, dereferencedSpecString);
    } else {
      logger.error('Failed to bundle spec file.');
      throw new Error('Failed to bundle spec file.');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to bundle OpenAPI spec: ${errorMessage}.`);
    throw error;
  }
}

/**
 * Updates the package.json file to add dependencies and scripts
 */
export async function updatePackageJson({
  clientType,
  projectRoot,
  tree,
}: {
  clientType: string;
  projectRoot: string;
  tree: Tree;
}) {
  logger.info(`Updating package.json for client type: ${clientType}`);

  logger.debug(`Importing latest-version package`);
  const { default: latestVersion } = await import('latest-version');

  const packageName = getPackageName(clientType);
  logger.debug(`Package name for client type: ${packageName}`);

  logger.debug(`Getting version for ${packageName}`);
  const packageVersion =
    getVersionOfPackage(clientType) || `^${await latestVersion(packageName)}`;
  logger.debug(`Using package version: ${packageVersion}`);

  logger.debug(`Getting latest version of @hey-api/openapi-ts`);
  const latestOpenApiTsVersion = `^${await latestVersion(
    '@hey-api/openapi-ts',
  )}`;
  logger.debug(`Latest @hey-api/openapi-ts version: ${latestOpenApiTsVersion}`);

  // Update package.json to add dependencies and scripts
  const deps: Record<string, string> = {
    '@hey-api/openapi-ts': latestOpenApiTsVersion,
    [packageName]: packageVersion,
  };

  if (packageName === '@hey-api/client-axios') {
    logger.debug(`Client type is axios, adding axios dependency`);
    const axiosVersion = await latestVersion('axios');
    logger.debug(`Latest axios version: ${axiosVersion}`);
    deps['axios'] = `^${axiosVersion}`;
  }

  logger.debug(
    `Adding dependencies to package.json: ${JSON.stringify(deps, null, 2)}`,
  );
  const installDeps = addDependenciesToPackageJson(
    tree,
    deps,
    {},
    join(projectRoot, 'package.json'),
  );

  return installDeps;
}

export function updateTsConfig({
  clientPlugins,
  projectName,
  projectRoot,
  projectScope,
  tree,
}: {
  clientPlugins: Record<string, ClientPluginOptions>;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  tree: Tree;
}) {
  const tsconfigName = CONSTANTS.TS_BASE_CONFIG_NAME;
  logger.info(`Updating tsconfig at: ${tsconfigName}`);
  logger.debug(`Adding paths for project: ${projectScope}/${projectName}`);

  try {
    updateJson(tree, tsconfigName, (json) => {
      const paths = json.compilerOptions.paths || {};
      logger.debug(
        `Adding path for main project: ${projectScope}/${projectName}`,
      );
      paths[`${projectScope}/${projectName}`] = [
        `./${projectRoot}/src/index.ts`,
      ];

      for (const plugin of Object.keys(clientPlugins)) {
        const item = clientPlugins[plugin];
        if (!item) {
          continue;
        }
        const pluginTsConfigPath = item.tsConfigCompilerPaths;
        if (pluginTsConfigPath) {
          logger.debug(`Adding TS config paths for plugin: ${plugin}`);
          // for each key in the pluginTsConfigPath object, add it to the paths object
          for (const [key, value] of Object.entries(pluginTsConfigPath)) {
            logger.debug(`Adding path: ${key} -> ${value}`);
            paths[key] = [value];
          }
        }
      }
      json.compilerOptions.paths = paths;
      return json;
    });
    logger.debug(`Successfully updated ${tsconfigName}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to update ${tsconfigName}: ${errorMessage}`);
    throw error;
  }
}
