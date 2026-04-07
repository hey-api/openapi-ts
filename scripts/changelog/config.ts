import fs from 'node:fs';
import path from 'node:path';

export interface ChangelogPackage {
  changelogPath?: string;
  name: string;
  path: string;
}

interface PackageJson {
  name?: string;
  private?: boolean;
}

let changelogPackagesCache: Array<ChangelogPackage> | undefined;

export function getChangelogPackages(): Array<ChangelogPackage> {
  if (changelogPackagesCache) return changelogPackagesCache;

  const packagesDirectory = path.join(process.cwd(), 'packages');
  const packageDirectories = fs.readdirSync(packagesDirectory, { withFileTypes: true });

  changelogPackagesCache = packageDirectories.flatMap((entry) => {
    if (!entry.isDirectory()) return [];

    const packageJsonPath = path.join(packagesDirectory, entry.name, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return [];

    const packageManifest = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
    if (packageManifest.private || !packageManifest.name) return [];

    const packagePath = path.join(packagesDirectory, entry.name);
    let changelogPath: string | undefined = path.join(packagePath, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) changelogPath = undefined;

    return [
      {
        changelogPath,
        name: packageManifest.name,
        path: packagePath,
      },
    ];
  });

  return changelogPackagesCache;
}

export const repo = 'hey-api/openapi-ts';
