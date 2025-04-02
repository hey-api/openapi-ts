import type { Tree } from '@nx/devkit';
import {
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

const tempFolder = join(process.cwd(), 'tmp');

export type OpenApiClientType = 'fetch' | 'axios';

export interface OpenApiClientGeneratorSchema {
  client: OpenApiClientType;
  directory?: string;
  name: string;
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
    projectDirectory,
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
  updatePackageJson({
    clientType,
    projectDirectory,
    projectName,
    projectRoot,
    projectScope,
    tree,
  });

  // Generate the client code
  generateClientCode({
    clientType,
    projectRoot,
  });

  // Format the files
  await formatFiles(tree);

  // Remove the temp folder
  await rm(tempFolder, { force: true, recursive: true });

  // Return a function that installs the packages
  return () => {
    installPackagesTask(tree);
  };
}

export interface NormalizedOptions {
  clientType: OpenApiClientType;
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
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = name.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${projectDirectory}`;
  const tagArray = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : ['api', 'openapi'];

  return {
    clientType: options.client,
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
  const { clientType, projectName, projectRoot, tagArray } = normalizedOptions;
  // Create basic project structure
  addProjectConfiguration(
    tree,
    projectName,
    {
      projectType: 'library',
      root: projectRoot,
      sourceRoot: `${projectRoot}/src`,
      tags: tagArray,
      targets: {
        build: {
          executor: '@nx/js:tsc',
          options: {
            additionalEntryPoints: [`${projectRoot}/src/rq.ts`],
            assets: [
              {
                glob: 'README.md',
                input: `./${projectRoot}`,
                output: '.',
              },
            ],
            main: `${projectRoot}/src/index.ts`,
            outputPath: `dist/${projectRoot}`,
            tsConfig: `${projectRoot}/tsconfig.lib.json`,
          },
          outputs: ['{options.outputPath}'],
        },
        generateApi: {
          executor: 'nx:run-commands',
          options: {
            command: `npx @hey-api/openapi-ts -i ./api/spec.yaml -o ./src/generated -c @hey-api/client-${clientType} -p @tanstack/react-query`,
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
      },
    },
    false,
  );

  // Create directory structure
  const templatePath = join(__dirname, 'files');
  generateFiles(tree, templatePath, projectRoot, {
    ...normalizedOptions,
    clientType: `@hey-api/client-${clientType}`,
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
  const apiDirectory = joinPathFragments(projectRoot, 'api');

  // Determine spec file paths
  const specDestination = joinPathFragments(apiDirectory, 'spec.yaml');
  const tempSpecDestination = joinPathFragments(tempFolder, 'api', 'spec.yaml');

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
export function updatePackageJson({
  clientType,
  projectDirectory,
  projectName,
  projectRoot,
  projectScope,
  tree,
}: {
  clientType: OpenApiClientType;
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
  projectScope: string;
  tree: Tree;
}) {
  // Update package.json to add dependencies and scripts
  if (tree.exists(`${projectRoot}/package.json`)) {
    updateJson(tree, `${projectRoot}/package.json`, (json) => {
      json.scripts = {
        ...json.scripts,
        generate: 'nx run ' + projectName + ':generateApi',
      };

      // Add the required dependencies
      json.dependencies = json.dependencies || {};
      json.devDependencies = json.devDependencies || {};

      // Add the client dependency
      if (clientType === 'fetch') {
        json.dependencies['@hey-api/client-fetch'] = '^0.9.0';
      } else if (clientType === 'axios') {
        json.dependencies['@hey-api/client-axios'] = '^0.7.0';
        json.dependencies['axios'] = '^1.6.0';
      }

      // Add dev dependency for the generator
      json.devDependencies['@hey-api/openapi-ts'] = '^0.66.0';

      return json;
    });
  }

  const tsConfigPath = join(workspaceRoot, 'tsconfig.base.json');
  if (existsSync(tsConfigPath)) {
    updateJson(tree, 'tsconfig.base.json', (json) => {
      const paths = json.compilerOptions.paths || {};
      paths[`${projectScope}/${projectName}`] = [
        `${projectDirectory}/${projectName}/src/index.ts`,
      ];
      paths[`${projectScope}/${projectName}/rq`] = [
        `${projectDirectory}/${projectName}/src/rq.ts`,
      ];
      json.compilerOptions.paths = paths;
      return json;
    });
  } else {
    logger.error(`Failed to find tsconfig.base.json file in ${workspaceRoot}`);
  }
}

/**
 * Generates the client code using the spec file
 */
export function generateClientCode({
  clientType,
  projectRoot,
}: {
  clientType: OpenApiClientType;
  projectRoot: string;
}) {
  logger.info(`Generating client code using spec file...`);
  // Copy bundled and dereferenced spec file to project
  execSync(
    `npx @hey-api/openapi-ts -i ${tempFolder}/api/spec.yaml -o ${projectRoot}/src/generated -c @hey-api/client-${clientType} -p @tanstack/react-query`,
    {
      stdio: 'inherit',
    },
  );
  logger.info(`Generated client code successfully.`);
}
