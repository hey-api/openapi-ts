import fs from 'node:fs';
import path from 'node:path';

/**
 * Finds and reads the project's package.json file by searching upwards from the config file location,
 * or from process.cwd() if no config file is provided.
 * This ensures we get the correct dependencies even in monorepo setups.
 *
 * @param configFilePath - The path to the configuration file (e.g., openapi-ts.config.ts)
 * @returns An object containing all project dependencies (dependencies, devDependencies, peerDependencies, optionalDependencies)
 */
export const getProjectDependencies = (
  configFilePath?: string,
): Record<string, string> => {
  let currentDir = configFilePath
    ? path.dirname(configFilePath)
    : process.cwd();

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8'),
        );
        return {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies,
          ...packageJson.optionalDependencies,
        };
      } catch {
        // Silently ignore JSON parsing errors and continue searching
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return {};
};
