import fs from 'node:fs';

import type { ChangelogPackage } from '../config';
import { getChangelogPackages } from '../config';

export type Changelogs = Map<string, PackageChangelog>;

export interface PackageChangelog {
  package: string;
  releases: Array<ReleaseBlock>;
}

export interface ReleaseBlock {
  content: string;
  hasUserFacingChanges: boolean;
  version: string;
  versionHeading: string;
}

const versionHeadingPattern = new RegExp(
  `^##\\s+(?:@hey-api\\/[^ ]+\\s+)?(\\d+\\.\\d+\\.\\d+)`,
  'm',
);

function extractReleaseBlock(content: string): ReleaseBlock | undefined {
  const versionMatch = content.match(versionHeadingPattern);
  if (!versionMatch) return;

  const versionStartIndex = versionMatch.index ?? 0;
  const versionHeading = versionMatch[0];
  const versionEndIndex = versionStartIndex + versionHeading.length;

  // find next version header (or end of file)
  const nextVersionMatch = content.slice(versionEndIndex).match(versionHeadingPattern);
  const nextVersionStartIndex = nextVersionMatch
    ? versionEndIndex + (nextVersionMatch.index ?? 0)
    : content.length;

  const versionBlockContent = content.slice(versionStartIndex, nextVersionStartIndex).trim();
  const contentWithoutUpdatedDependencies = versionBlockContent
    .replace(/\n###\s+Updated Dependencies:?\s*(?:\n[\s\S]*?)?(?=\n#{2,6}\s|$)/gi, '')
    .trim();

  // Check for "Updated dependencies" only (no user-facing changes, changelogs quirk)
  const hasUpdatedDependencies = /^###\s+Updated Dependencies:?\s*$/im.test(versionBlockContent);
  const hasOtherSectionHeadings = /^###\s+(?!Updated Dependencies:?\s*$).+/im.test(
    versionBlockContent,
  );
  const hasUserFacingChanges = !(hasUpdatedDependencies && !hasOtherSectionHeadings);

  return {
    content: contentWithoutUpdatedDependencies,
    hasUserFacingChanges,
    version: versionMatch[1],
    versionHeading,
  };
}

function readPackageChangelog(pkg: ChangelogPackage): PackageChangelog | undefined {
  if (!pkg.changelogPath) return;

  const content = fs.readFileSync(pkg.changelogPath, 'utf-8');
  const releases: PackageChangelog['releases'] = [];

  let remaining = content.replace(/^#\s+.*\n\n?/, ''); // strip title
  while (remaining.trim()) {
    const release = extractReleaseBlock(remaining);
    if (!release) break;

    releases.push(release);

    // move past this release
    const releaseStart = remaining.indexOf(release.versionHeading);
    const afterVersionHeading = remaining.slice(releaseStart + release.versionHeading.length);
    const nextVersionMatch = afterVersionHeading.match(versionHeadingPattern);
    if (!nextVersionMatch) break;

    const nextStart = releaseStart + release.versionHeading.length + (nextVersionMatch.index ?? 0);
    remaining = remaining.slice(nextStart).trimStart();
  }

  return { package: pkg.name, releases };
}

export function readAllPackageChangelogs(): Changelogs {
  const changelogs: Changelogs = new Map();

  for (const pkg of getChangelogPackages()) {
    const changelog = readPackageChangelog(pkg);
    if (changelog) changelogs.set(pkg.name, changelog);
  }

  return changelogs;
}
