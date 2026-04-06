import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { packageOrder } from '../config.js';

export interface PackageChangelog {
  package: string;
  versions: Array<{
    content: string;
    hasUserFacingChanges: boolean;
    version: string;
  }>;
}

function extractVersionBlock(content: string): {
  content: string;
  hasUserFacingChanges: boolean;
  version: string;
} | null {
  // Match version header like "## 0.95.0" or "## @hey-api/openapi-ts 0.95.0"
  const versionMatch = content.match(/^##\s+(?:@hey-api\/[^ ]+\s+)?(\d+\.\d+\.\d+)/m);
  if (!versionMatch) return null;

  const version = versionMatch[1];
  const versionStart = content.indexOf(`##`);

  // Find next version header or end of file
  const afterVersion = content.slice(versionStart + 2);
  const nextVersionMatch = afterVersion.match(/^##\s+/m);
  const nextVersionStart = nextVersionMatch
    ? versionStart + 2 + (nextVersionMatch.index ?? 0)
    : content.length;

  const blockContent = content.slice(versionStart, nextVersionStart).trim();

  // Check for "Updated dependencies" only (no user-facing changes)
  const hasUserFacingChanges = !(
    blockContent.includes('### Updated Dependencies') &&
    !blockContent.match(/^##\s+[^#]*\n### (?!Updated Dependencies)/m)
  );

  return { content: blockContent, hasUserFacingChanges, version };
}

export function readPackageChangelog(packagePath: string): PackageChangelog | null {
  const changelogPath = join(packagePath, 'CHANGELOG.md');

  if (!existsSync(changelogPath)) {
    return null;
  }

  const content = readFileSync(changelogPath, 'utf-8');

  // Skip the package title "# @hey-api/package-name"
  const body = content.replace(/^#\s+@hey-api\/[^ ]+\n\n?/, '');

  const versions: PackageChangelog['versions'] = [];
  let remaining = body;

  while (remaining.trim()) {
    const block = extractVersionBlock(remaining);
    if (!block) break;

    versions.push(block);

    // Move past this block
    const blockStart = remaining.indexOf(`## ${block.version}`);
    const afterBlock = remaining.slice(blockStart + 2);
    const nextVersionMatch = afterBlock.match(/^##\s+/m);
    const nextStart = nextVersionMatch
      ? blockStart + 2 + (nextVersionMatch.index ?? 0)
      : remaining.length;
    remaining = remaining.slice(nextStart);
  }

  return { package: '', versions };
}

export function readAllPackageChangelogs(): Map<string, PackageChangelog> {
  const results = new Map<string, PackageChangelog>();

  for (const packageName of packageOrder) {
    // Convert package name to path (e.g., @hey-api/openapi-ts -> packages/openapi-ts)
    const packagePath = packageName.replace('@hey-api/', 'packages/');
    const changelog = readPackageChangelog(packagePath);

    if (changelog) {
      changelog.package = packageName;
      results.set(packageName, changelog);
    }
  }

  return results;
}

export function getChangelogPath(packageName: string): string {
  return packageName.replace('@hey-api/', 'packages/') + '/CHANGELOG.md';
}
