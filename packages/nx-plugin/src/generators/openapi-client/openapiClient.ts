import { existsSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

import { defaultPlugins } from '@hey-api/openapi-ts';
import type { ProjectConfiguration, Tree } from '@nx/devkit';
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  detectPackageManager,
  formatFiles,
  generateFiles,
  getProjects,
  installPackagesTask,
  isWorkspacesEnabled,
  joinPathFragments,
  logger,
  names,
  readJson,
  updateJson,
  workspaceRoot,
} from '@nx/devkit';

import packageJson from '../../../package.json';
import type { UpdateApiExecutorSchema } from '../../executors/update-api/schema';
import type { Plugin } from '../../utils';
import {
  bundleAndDereferenceSpecFile,
  generateClientCode,
  generateClientCommand,
  getBaseTsConfigPath,
  getPackageName,
  getPluginName,
  getVersionOfPackage,
  isAFile,
  isUrl,
  makeDir,
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
  inputPlugins: Plugin[];
}): Record<string, ClientPluginOptions> => {
  const plugins: Record<string, ClientPluginOptions> = {
    '@tanstack/react-query': {
      additionalEntryPoints: [`{projectRoot}/src/rq.ts`],
      templateFilesPath: './plugins/rq',
      tsConfigCompilerPaths: {
        [`${projectScope}/${projectName}/rq`]: `./${projectRoot}/src/rq.ts`,
      },
    },
  };

  // Filter the plugins that are in the inputPlugins array
  const filteredPlugins = Object.keys(plugins)
    .filter((plugin) => inputPlugins.map(getPluginName).includes(plugin))
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
     * Additional dev dependencies to be added to the project
     */
    additionalDevDependencies?: string[];
    /**
     * The template path to the test files
     */
    templatePath: string;
  }
> = {
  vitest: {
    additionalDevDependencies: ['vite', 'vitest'],
    templatePath: './tests/vitest',
  },
};

export interface OpenApiClientGeneratorSchema {
  /**
   * Whether to use the class style for the generated code, defaults to `false`
   */
  asClass?: boolean;
  /**
   * The name of the base tsconfig file that contains the compiler paths used to resolve the imports, use this if the base tsconfig file is in the workspace root,
   * if provided with a baseTsConfigPath then the baseTsConfigName will be added to the path.
   * DO not use this if the baseTsConfigPath is a file.
   */
  baseTsConfigName?: string;
  /**
   * The path to the base tsconfig file that contains the compiler paths used to resolve the imports, use this if the base tsconfig file is not in the workspace root.
   * This can be a file or a directory. If it is a directory and the baseTsConfigName is provided then the baseTsConfigName will be added to the path.
   * If it is a file and the baseTsConfigName is provided then there will be an error.
   */
  baseTsConfigPath?: string;
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
   * Whether to make the generated package private, defaults to `true`
   */
  private?: boolean;
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
   * The directory to use for the temp folder, defaults to `./plugin-tmp`
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
  const normalizedOptions = normalizeOptions(options);
  logger.debug(
    `Normalized options: ${JSON.stringify(normalizedOptions, null, 2)}`,
  );
  const {
    clientType,
    isPrivate,
    plugins,
    projectName,
    projectRoot,
    projectScope,
    specFile,
    tempFolder,
  } = normalizedOptions;
  const absoluteTempFolder = join(process.cwd(), tempFolder);
  logger.info(
    `Generating OpenAPI client for '${projectName}' using client type '${clientType}'`,
  );
  logger.debug(`Using plugins: ${plugins.join(', ')}`);
  try {
    const clientPlugins = getClientPlugins({
      ...normalizedOptions,
      inputPlugins: plugins,
    });
    logger.debug(`Found ${Object.keys(clientPlugins).length} client plugins`);

    // Create the temp folder
    if (!existsSync(tempFolder)) {
      logger.debug(`Creating temp folder: ${tempFolder}`);
      await makeDir(tempFolder);
    } else {
      logger.debug(`Temp folder already exists: ${tempFolder}`);
    }

    // Generate the Nx project
    logger.info(`Generating Nx project structure`);
    await generateNxProject({
      clientPlugins,
      normalizedOptions,
      tree,
    });

    // Generate the api client code
    logger.info(`Generating API client code using spec file: ${specFile}`);
    const { specFileLocalLocations } = await generateApi({
      client: clientType,
      plugins,
      projectRoot,
      specFile,
      tempFolder,
      tree,
    });

    // Update the package.json file
    logger.info(`Updating package.json with dependencies`);
    await updatePackageJson({
      clientType,
      isPrivate,
      plugins,
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
      specFile: specFileLocalLocations,
    });

    // Format the files
    logger.debug(`Formatting generated files`);
    await formatFiles(tree);

    logger.info(
      `OpenAPI client generator completed successfully for ${projectName}`,
    );
    // Return a function that installs the packages
    return async () => {
      logger.info(`Installing dependencies for ${projectName}`);
      const packageManager = detectPackageManager(workspaceRoot);

      installPackagesTask(tree, true, workspaceRoot, packageManager);
      logger.info(`Dependencies installed successfully`);
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`OpenAPI client generator failed: ${errorMessage}`);
    throw error;
  } finally {
    logger.debug(`Removing temp folder: ${absoluteTempFolder}`);
    await rm(absoluteTempFolder, { force: true, recursive: true });
  }
}

export interface NormalizedOptions {
  baseTsConfigName: string | undefined;
  baseTsConfigPath: string | undefined;
  clientType: string;
  isPrivate: boolean;
  plugins: Plugin[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  specFile: string;
  tagArray: string[];
  tempFolder: string;
  test: TestRunner | 'none';
}

export type GeneratedOptions = NormalizedOptions &
  typeof CONSTANTS & {
    pathToTsConfig: string;
    tsConfigName: string;
  };

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
  const projectRoot = `${projectDirectory}/${projectName}`;

  const tagArray = Array.from(
    new Set(
      (typeof options.tags === 'string'
        ? (options.tags as string).split(',')
        : (options.tags ?? [])
      ).map((s) => s.trim()),
    ),
  );
  // use the provided temp folder or use the default temp folder and append the project name to it
  // we append the project name to the temp folder to avoid conflicts between different projects using the same temp folder
  const tempFolder =
    options.tempFolderDir ?? join(defaultTempFolder, projectName);
  const [default1, default2, ...rest] = defaultPlugins;
  const plugins = [
    default1,
    options.asClass
      ? {
          asClass: true,
          name: default2,
        }
      : default2,
    ...rest,
    ...options.plugins,
  ];

  return {
    baseTsConfigName: options.baseTsConfigName,
    baseTsConfigPath: options.baseTsConfigPath,
    clientType: options.client,
    isPrivate: options.private ?? true,
    plugins,
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
 * Builds the spec path
 */
export function buildSpecPath(specPath: string) {
  const isSpecFileUrl = isUrl(specPath);
  if (isSpecFileUrl) {
    return specPath;
  }
  const isSpecFileAbsolutePath = isAbsolute(specPath);
  if (isSpecFileAbsolutePath) {
    return specPath;
  }
  const newSpecPath = specPath.replace('./', `{workspaceRoot}/`);
  return newSpecPath;
}

export function buildUpdateOptions({
  clientType,
  plugins,
  projectDirectory,
  projectName,
  projectScope,
  specFile,
}: NormalizedOptions): UpdateApiExecutorSchema {
  const newSpecFilePath = buildSpecPath(specFile);

  return {
    client: clientType,
    directory: projectDirectory,
    name: projectName,
    plugins,
    scope: projectScope,
    spec: newSpecFilePath,
  };
}

/**
 * Generates the nx project
 */
export async function generateNxProject({
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
    baseTsConfigName,
    baseTsConfigPath,
    clientType,
    plugins,
    projectName,
    projectRoot,
    projectScope,
    specFile,
    tagArray,
    test,
  } = normalizedOptions;

  const specIsAFile = isAFile(specFile);
  const isSpecRemote = isUrl(specFile);

  const additionalEntryPoints: string[] = [];

  for (const plugin of plugins) {
    const clientPlugin = clientPlugins[getPluginName(plugin)];
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

  const dependentTasksOutputFiles = '**/*.{ts,json,yml,yaml}';

  const updateInputs: Input[] = [{ dependentTasksOutputFiles }, ...baseInputs];

  if (specIsAFile) {
    // if the spec file is a file then we need to add it to inputs so that it is watched by NX
    updateInputs.push(buildSpecPath(specFile));
  } else if (isSpecRemote) {
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

  // if the spec file is remote then we don't need to depend on a project
  // otherwise we need to get the project that the spec file is in (if it is in a project)
  const dependsOnProject = isSpecRemote
    ? undefined
    : await getProjectThatSpecIsIn(tree, specFile);
  if (dependsOnProject) {
    logger.debug(
      `Setting ${dependsOnProject} as an implicit dependency because the spec file is in that project.`,
    );
  }

  const { tsConfigDirectory, tsConfigName } = await getBaseTsConfigPath({
    baseTsConfigName,
    baseTsConfigPath,
    projectRoot,
  });

  // Create basic project structure
  addProjectConfiguration(tree, `${projectScope}/${projectName}`, {
    implicitDependencies: dependsOnProject ? [dependsOnProject] : [],
    projectType: 'library',
    root: projectRoot,
    sourceRoot: `{projectRoot}/src`,
    tags: tagArray,
    targets: {
      build: {
        dependsOn: ['^build', 'updateApi'],
        executor: '@nx/js:tsc',
        inputs: [{ dependentTasksOutputFiles }, ...baseInputs],
        options: {
          additionalEntryPoints,
          assets: [
            {
              glob: 'README.md',
              input: `./{projectRoot}`,
              output: '.',
            },
          ],
          generateExportsField: true,
          generatePackageJson: true,
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
        dependsOn: ['^build'],
        executor: `${packageJson.name}:update-api`,
        inputs: updateInputs,
        options: buildUpdateOptions(normalizedOptions),
        outputs: [
          `{projectRoot}/src/${CONSTANTS.GENERATED_DIR_NAME}`,
          `{projectRoot}/${CONSTANTS.SPEC_DIR_NAME}`,
        ],
      },
    },
  });

  /**
   * The variables that are passed to the template files
   */
  const generatedOptions: GeneratedOptions = {
    ...normalizedOptions,
    ...CONSTANTS,
    pathToTsConfig: tsConfigDirectory,
    plugins: plugins.map(getPluginName),
    tsConfigName,
  };

  // Create directory structure
  const templatePath = join(__dirname, 'files');
  generateFiles(tree, templatePath, projectRoot, generatedOptions);

  for (const plugin of plugins) {
    const pluginConfiguration = clientPlugins[getPluginName(plugin)];
    if (pluginConfiguration) {
      handlePlugin({
        generatedOptions,
        pluginConfiguration,
        projectRoot,
        tree,
      });
    }
  }

  // Generate the test files
  if (test !== 'none') {
    await generateTestFiles({
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
  pluginConfiguration,
  projectRoot,
  tree,
}: {
  generatedOptions: GeneratedOptions;
  pluginConfiguration: ClientPluginOptions;
  projectRoot: string;
  tree: Tree;
}) {
  if (pluginConfiguration.templateFilesPath) {
    const pluginTemplatePath = join(
      __dirname,
      pluginConfiguration.templateFilesPath,
    );
    generateFiles(tree, pluginTemplatePath, projectRoot, generatedOptions);
  }
}

export async function generateTestFiles({
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

  // add the dev dependencies
  const { additionalDevDependencies } = testRunners[test];
  if (additionalDevDependencies && additionalDevDependencies.length > 0) {
    const depsTask = additionalDevDependencies.map(getPackageDetails);
    const results = await Promise.all(depsTask);
    const devDeps = results.reduce(
      (acc, result) => {
        acc[result.packageName] = result.packageVersion;
        return acc;
      },
      {} as Record<string, string>,
    );
    addDependenciesToPackageJson(
      tree,
      {},
      devDeps,
      join(projectRoot, 'package.json'),
    );
  }
}

/**
 * Gathers the OpenAPI spec file from the project and writes it to the temp folder
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
  plugins: Plugin[];
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

    const dereferencedSpecString = JSON.stringify(dereferencedSpec, null, 2);
    const absoluteSpecDestination = join(process.cwd(), tempSpecFolder);

    if (!dereferencedSpec) {
      logger.error('Failed to bundle spec file.');
      throw new Error('Failed to bundle spec file.');
    }

    // Read the bundled file back into the tree
    try {
      // write to temp spec destination
      await makeDir(absoluteSpecDestination);
      writeFileSync(absoluteTempSpecDestination, dereferencedSpecString);
      logger.debug(
        `Dereferenced spec written to temp file: ${absoluteTempSpecDestination}`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        `Failed to write dereferenced spec to temp file: ${errorMessage}.`,
      );
      throw error;
    }
    // write to to destination in the tree
    tree.write(specDestination, dereferencedSpecString);
    return {
      specFileLocalLocations: absoluteTempSpecDestination,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to bundle OpenAPI spec: ${errorMessage}.`);
    throw error;
  }
}

async function getPackageDetails(name: string) {
  const { default: latestVersion } = await import('latest-version');

  const packageName = getPackageName(name);
  const packageVersion =
    getVersionOfPackage(name) || `^${await latestVersion(packageName)}`;

  return {
    packageName,
    packageVersion,
  };
}

/**
 * Updates the package.json file to add dependencies and scripts
 */
export async function updatePackageJson({
  clientType,
  isPrivate,
  plugins,
  projectRoot,
  tree,
}: {
  clientType: string;
  /**
   * Whether to make the generated package private
   */
  isPrivate: boolean;
  plugins: Plugin[];
  projectRoot: string;
  tree: Tree;
}) {
  const { default: latestVersion } = await import('latest-version');

  // add the client as a dependency
  const clientDetails = getPackageDetails(clientType);
  // add the openapi-ts as a dependency
  const openApiTsDetails = getPackageDetails('@hey-api/openapi-ts');
  // add the plugins as dependencies
  const pluginDetails = plugins
    // filter out the default plugins as they are not packages
    .filter(
      (plugin) =>
        !(defaultPlugins as unknown as string[]).includes(
          getPluginName(plugin),
        ),
    )
    .map((plugin) => getPackageDetails(getPluginName(plugin)));

  const results = await Promise.all([
    clientDetails,
    openApiTsDetails,
    ...pluginDetails,
  ]);

  // Update package.json to add dependencies and scripts
  const deps = results.reduce(
    (acc, result) => {
      acc[result.packageName] = result.packageVersion;
      return acc;
    },
    {} as Record<string, string>,
  );

  if ((await clientDetails).packageName === '@hey-api/client-axios') {
    const axiosVersion = await latestVersion('axios');
    deps['axios'] = `^${axiosVersion}`;
  }

  addDependenciesToPackageJson(
    tree,
    deps,
    {},
    join(projectRoot, 'package.json'),
  );

  if (!isWorkspacesEnabled(detectPackageManager(workspaceRoot))) {
    if (tree.exists(join(workspaceRoot, 'package.json'))) {
      // if workspaces are not enabled then we need to install the dependencies to the root
      addDependenciesToPackageJson(
        tree,
        deps,
        {},
        join(workspaceRoot, 'package.json'),
      );
    } else {
      logger.warn(
        'Could not add dependencies to root package.json. Packages may needed to be added manually.',
      );
    }
  }

  // update the private and publishConfig field in the package.json file
  updateJson(tree, join(projectRoot, 'package.json'), (json) => {
    if (isPrivate) {
      json.private = isPrivate;
    } else {
      json.publishConfig = {
        access: 'public',
      };
    }
    return json;
  });
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
    logger.error(`Failed to update ${tsconfigName}: ${errorMessage}.`);
    throw error;
  }
}

/**
 * Get the project that the spec file is in, if the spec file is in the root then do not return anything,
 * if the spec file is in a subdirectory then return the project that the subdirectory is in
 * @param tree - The tree to get the project from
 * @param specFile - The spec file to get the project from
 * @returns The project that the spec file is in
 */
export async function getProjectThatSpecIsIn(tree: Tree, specFile: string) {
  const projects = getProjects(tree);
  for (const project of projects.values()) {
    const normalizedSpecFile = resolve(specFile);
    const normalizedProjectRoot = resolve(project.root);
    // if the spec file is under the project root then return the project name
    if (normalizedSpecFile.startsWith(normalizedProjectRoot)) {
      const projectJsonName = project.name;
      if (projectJsonName) {
        logger.debug('Provided spec file is in project: ', projectJsonName);
        return projectJsonName;
      }
      const packageJsonPath = join(project.root, 'package.json');
      const packageJson = readJson(tree, packageJsonPath);
      const projectName = packageJson.name;
      if (!projectName) {
        throw new Error('No name found in package.json.');
      } else if (typeof projectName === 'string') {
        logger.debug('Provided spec file is in project: ', projectName);
        return projectName;
      }
      throw new Error('Project name is not a valid string.');
    }
  }
  return null;
}
