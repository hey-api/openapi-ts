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
import { existsSync, writeFileSync } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

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
  const normalizedOptions = normalizeOptions(options);
  const {
    clientType,
    plugins,
    projectName,
    projectRoot,
    projectScope,
    specFile,
    tempFolder,
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
    client: clientType,
    plugins,
    projectRoot,
    specFile,
    tempFolder,
    tree,
  });

  // Update the package.json file
  const installDeps = await updatePackageJson({
    clientType,
    projectRoot,
    tree,
  });

  // Update the tsconfig.base.json file
  updateTsConfig({
    clientPlugins,
    projectName,
    projectRoot,
    projectScope,
    tree,
  });

  // Generate the client code
  await generateClientCode({
    clientType,
    outputPath: `${projectRoot}/src/${CONSTANTS.GENERATED_DIR_NAME}`,
    plugins,
    specFile: `${tempFolder}/${CONSTANTS.SPEC_DIR_NAME}/${CONSTANTS.SPEC_FILE_NAME}`,
  });

  // Format the files
  await formatFiles(tree);

  // Remove the temp folder
  const absoluteTempFolder = join(process.cwd(), tempFolder);
  logger.debug(`Removing temp folder: ${absoluteTempFolder}`);
  await rm(absoluteTempFolder, { force: true, recursive: true });

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
  const name = names(options.name).fileName;
  const projectDirectory = names(options.directory).fileName.replace('./', '');
  const projectName = name.replace(new RegExp('/', 'g'), '-');
  logger.info(`Project name: ${options.tags}`);
  const projectRoot = `${projectDirectory}/${projectName}`;
  const tagArray = (options.tags ?? []).map((s) => s.trim());

  const tempFolder = options.tempFolderDir ?? defaultTempFolder;

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

  const updateOptions: UpdateApiExecutorSchema = {
    client: clientType,
    directory: projectDirectory,
    name: projectName,
    plugins,
    scope: projectScope,
    spec: specFile,
  };

  const specIsAFile = isAFile(specFile);
  const specIsRemote = isUrl(specFile);

  const additionalEntryPoints: string[] = [];

  for (const plugin of plugins) {
    const clientPlugin = clientPlugins[plugin];
    if (clientPlugin) {
      additionalEntryPoints.push(...(clientPlugin.additionalEntryPoints ?? []));
    }
  }

  const baseInputs: Input[] = [
    `{projectRoot}/${CONSTANTS.SPEC_DIR_NAME}`,
    '{projectRoot}/package.json',
    '{projectRoot}/tsconfig.json',
    '{projectRoot}/tsconfig.lib.json',
    '{projectRoot}/openapi-ts.config.ts',
  ];

  const updateInputs: Input[] = [...baseInputs];

  if (specIsAFile) {
    // if the spec file is a file then we need to add it to inputs so that it is watched by NX
    updateInputs.push(specFile);
  } else if (specIsRemote) {
    // here we should add a hash of the spec file to the inputs so that NX will watch for changes
    // fetch the spec file from url and get the hash
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

  // Create directory structure
  const templatePath = join(__dirname, 'files');
  generateFiles(tree, templatePath, projectRoot, generatedOptions);

  for (const plugin of plugins) {
    const pluginConfig = clientPlugins[plugin];
    if (pluginConfig) {
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
    generateTestFiles({
      generatedOptions,
      projectRoot,
      test,
      tree,
    });
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
  if (plugin.templateFilesPath) {
    const pluginTemplatePath = join(__dirname, plugin.templateFilesPath);
    generateFiles(tree, pluginTemplatePath, projectRoot, generatedOptions);
  }

  const packageJsonExports = plugin.packageJsonExports;
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
  // link the tsconfig.spec.json to the tsconfig.json
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
  generateFiles(
    tree,
    join(__dirname, templatePath),
    projectRoot,
    generatedOptions,
  );
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
  // Create api directory if it doesn't exist
  const apiDirectory = joinPathFragments(projectRoot, CONSTANTS.SPEC_DIR_NAME);

  // Determine spec file paths
  const specDestination = joinPathFragments(
    apiDirectory,
    CONSTANTS.SPEC_FILE_NAME,
  );

  const tempSpecFolder = joinPathFragments(tempFolder, CONSTANTS.SPEC_DIR_NAME);

  // Create a full file path for the temp spec files
  const tempSpecDestination = joinPathFragments(
    tempSpecFolder,
    CONSTANTS.SPEC_FILE_NAME,
  );

  try {
    const absoluteTempSpecDestination = join(
      process.cwd(),
      tempSpecDestination,
    );
    // Ensure the directories exist in the tree file system
    tree.write(specDestination, '');

    const dereferencedSpec = await bundleAndDereferenceSpecFile({
      client,
      outputPath: absoluteTempSpecDestination,
      plugins,
      specPath: specFile,
    });
    logger.info(`OpenAPI spec file bundled successfully.`);

    const dereferencedSpecString = JSON.stringify(dereferencedSpec, null, 2);
    const absoluteSpecDestination = join(process.cwd(), tempSpecFolder);
    // Read the bundled file back into the tree
    if (dereferencedSpec) {
      try {
        logger.debug(
          `Writing dereferenced spec to temp file ${absoluteTempSpecDestination}...`,
        );
        // write to temp spec destination
        await mkdir(absoluteSpecDestination, { recursive: true });
        writeFileSync(absoluteTempSpecDestination, dereferencedSpecString);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(
          `Failed to write dereferenced spec to temp file: ${errorMessage}.`,
        );
        throw error;
      }
      // write to to destination in the tree
      // TODO: do we need this after we write to disk?
      tree.write(specDestination, dereferencedSpecString);
    } else {
      logger.error('Failed to bundled spec file.');
      throw new Error('Failed to bundled spec file.');
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
  try {
    updateJson(tree, tsconfigName, (json) => {
      const paths = json.compilerOptions.paths || {};
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
          // for each key in the pluginTsConfigPath object, add it to the paths object
          for (const [key, value] of Object.entries(pluginTsConfigPath)) {
            paths[key] = [value];
          }
        }
      }
      json.compilerOptions.paths = paths;
      return json;
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to update ${tsconfigName}: ${errorMessage}`);
    throw error;
  }
}
