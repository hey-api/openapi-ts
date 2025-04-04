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
import latestVersion from 'latest-version';
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

  // Create the temp folder
  if (!existsSync(tempFolder)) {
    await mkdir(tempFolder);
  }

  // Generate the Nx project
  generateNxProject({
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
  normalizedOptions,
  tree,
}: {
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

  if (plugins.includes('@tanstack/react-query')) {
    additionalEntryPoints.push(`${projectRoot}/src/rq.ts`);
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
          outputPath: `dist/${projectRoot}`,
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
      lint: {
        executor: '@nx/eslint:lint',
        options: {
          lintFilePatterns: [
            `${projectRoot}/**/*.ts`,
            `${projectRoot}/package.json`,
          ],
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
  clientType,
  projectName,
  projectRoot,
  projectScope,
  tree,
}: {
  clientType: string;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  tree: Tree;
}) {
  const packageName = getPackageName(clientType);
  const packageVersion =
    getVersionOfPackage(clientType) || (await latestVersion(packageName));

  // Update package.json to add dependencies and scripts
  const deps: Record<string, string> = {
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
      paths[`${projectScope}/${projectName}/rq`] = [
        `./${projectRoot}/src/rq.ts`,
      ];
      json.compilerOptions.paths = paths;
      return json;
    });
  } else {
    logger.error(`Failed to find ${tsconfigName} file in ${workspaceRoot}.`);
    throw new Error(`Failed to find ${tsconfigName} file in ${workspaceRoot}.`);
  }

  return installDeps;
}
