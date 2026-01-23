import fs from 'node:fs';
import path from 'node:path';

import type { AnyString } from '@hey-api/types';
import ts from 'typescript';

export function findPackageJson(initialDir: string): unknown | undefined {
  let dir = initialDir;
  while (dir !== path.dirname(dir)) {
    const files = fs.readdirSync(dir);
    const candidates = files.filter((file) => file === 'package.json');

    if (candidates[0]) {
      const packageJsonPath = path.join(dir, candidates[0]);
      return JSON.parse(
        fs.readFileSync(packageJsonPath, {
          encoding: 'utf8',
        }),
      );
    }

    dir = path.dirname(dir);
  }

  return;
}

type PackageJson = {
  bugs: {
    url: string;
  };
  name: string;
  version: string;
};

export function loadPackageJson(initialDir: string): PackageJson | undefined {
  const packageJson = findPackageJson(initialDir);

  const safePackage: PackageJson = {
    bugs: {
      url: '',
    },
    name: '',
    version: '',
  };

  if (packageJson && typeof packageJson === 'object') {
    if ('name' in packageJson && typeof packageJson.name === 'string') {
      safePackage.name = packageJson.name;
    }

    if ('version' in packageJson && typeof packageJson.version === 'string') {
      safePackage.version = packageJson.version;
    }

    if (
      'bugs' in packageJson &&
      packageJson.bugs &&
      typeof packageJson.bugs === 'object'
    ) {
      if (
        'url' in packageJson.bugs &&
        typeof packageJson.bugs.url === 'string'
      ) {
        safePackage.bugs.url = packageJson.bugs.url;
        if (safePackage.bugs.url && !safePackage.bugs.url.endsWith('/')) {
          safePackage.bugs.url += '/';
        }
      }
    }
  }

  if (!safePackage.name) return;

  return safePackage;
}

export function findTsConfigPath(
  baseDir: string,
  tsConfigPath?: AnyString | null,
): string | null {
  if (tsConfigPath === null) {
    return null;
  }

  if (tsConfigPath) {
    const resolved = path.isAbsolute(tsConfigPath)
      ? tsConfigPath
      : path.resolve(baseDir, tsConfigPath);
    return fs.existsSync(resolved) ? resolved : null;
  }

  let dir = baseDir;
  while (dir !== path.dirname(dir)) {
    const files = fs.readdirSync(dir);
    const candidates = files
      .filter((file) => file.startsWith('tsconfig') && file.endsWith('.json'))
      .sort((file) => (file === 'tsconfig.json' ? -1 : 1));

    if (candidates[0]) {
      return path.join(dir, candidates[0]);
    }

    dir = path.dirname(dir);
  }

  return null;
}

export function loadTsConfig(
  configPath: string | null,
): ts.ParsedCommandLine | null {
  if (!configPath) {
    return null;
  }

  const raw = ts.readConfigFile(configPath, ts.sys.readFile);

  if (raw.error) {
    throw new Error(`Couldn't read tsconfig from path: ${configPath}`);
  }

  return ts.parseJsonConfigFileContent(
    raw.config,
    ts.sys,
    path.dirname(configPath),
  );
}
