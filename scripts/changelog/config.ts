import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import type { ChangelogPackage, PackageJson } from './types';

export const AGENT_USERS = new Set(['copilot-swe-agent', 'claude']);
export const REPOSITORY_ROOT = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..',
  '..',
);
export const CONFIG_PATH = path.resolve(REPOSITORY_ROOT, '.heyapi.json');

export const SPONSORS_TABLE_GOLD_PATH = path.resolve(
  REPOSITORY_ROOT,
  'scripts',
  'templates',
  'sponsors-table-gold.md',
);

/** The package used for legacy tag patterns (e.g., v0.27.39) */
export const LEGACY_TAG_PACKAGE = '@hey-api/openapi-ts';

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

function getPackageBaseName(packageName: string): string {
  if (packageName.startsWith('@') && packageName.includes('/')) {
    return packageName.split('/')[1]!;
  }
  return packageName;
}

export function isFlagshipPackage(packageName: string): boolean {
  const baseName = getPackageBaseName(packageName);
  return baseName.startsWith('openapi-');
}

export function isExecutedDirectly(fileUrl: string): boolean {
  return (
    typeof process.argv[1] === 'string' &&
    path.resolve(process.argv[1]) === url.fileURLToPath(fileUrl)
  );
}
