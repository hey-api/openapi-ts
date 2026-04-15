import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { getChangelogPackages, LEGACY_TAG_PACKAGE } from './config';
import { getAllTags } from './release-tag';
import type { ReleaseTag } from './types';

const packageTagPattern = /^(.+)@(\d+\.\d+\.\d+)$/;
const legacyTagPattern = /^v(\d+\.\d+\.\d+)$/;
const releaseDatePattern = /^\d{4}-\d{2}-\d{2}(?:\.\d+)?$/;
const changelogDateHeadingPattern = /^#\s+(\d{4}-\d{2}-\d{2})\s*$/gm;
const changelogPackageHeadingPattern = /^##\s+(@hey-api\/[^\s]+)\s+(\d+\.\d+\.\d+)\s*$/gm;
const changelogVersionHeadingPattern = /^##\s+(?:@hey-api\/[^ ]+\s+)?(\d+\.\d+\.\d+)/m;

function isoDateToTimestamp(isoDate: string): number {
  const match = isoDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([+-]\d{2})(\d{2})$/);
  if (!match) {
    return Date.parse(isoDate) || 0;
  }

  const [, date, time, offsetHour, offsetMinute] = match;
  const iso = `${date}T${time}${offsetHour}:${offsetMinute}`;
  return Date.parse(iso) || 0;
}

function getTagDates(tag: string): Pick<ReleaseTag, 'date' | 'timestamp'> {
  const isoDate = execSync(`git log -1 --format=%ci ${tag}`, { encoding: 'utf-8' }).trim();

  const timestamp = isoDateToTimestamp(isoDate);
  if (timestamp > 0) {
    const normalized = new Date(timestamp).toISOString();
    const date = normalized.slice(0, 10);
    return {
      date,
      timestamp,
    };
  }

  const match = isoDate.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  const date = match?.[1] ?? isoDate;
  return {
    date,
    timestamp: 0,
  };
}

function getSnapshotReleaseTags(
  dates: Pick<ReleaseTag, 'date' | 'timestamp'>,
  tag: string,
  packageNamesByChangelogPath: Map<string, string>,
): Array<ReleaseTag> {
  const snapshotTags: Array<ReleaseTag> = [];

  const getSnapshotReleaseTagsFromCommit = (commitish: string): Array<ReleaseTag> => {
    const releaseTags: Array<ReleaseTag> = [];
    const changedChangelogFiles = execSync(
      `git show --name-only --pretty="" ${commitish} -- packages/*/CHANGELOG.md`,
      { encoding: 'utf-8' },
    )
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const changelogPath of changedChangelogFiles) {
      const packageName = packageNamesByChangelogPath.get(changelogPath);
      if (!packageName) continue;

      const changelogContent = execSync(`git show ${commitish}:${changelogPath}`, {
        encoding: 'utf-8',
      });
      const versionMatch = changelogContent.match(changelogVersionHeadingPattern);
      const version = versionMatch?.[1];
      if (!version) continue;

      releaseTags.push({
        date: dates.date,
        packageName,
        timestamp: dates.timestamp,
        version,
      });
    }

    return releaseTags;
  };

  try {
    snapshotTags.push(...getSnapshotReleaseTagsFromCommit(tag));
  } catch {
    // Fallback to root CHANGELOG parsing below.
  }

  if (!snapshotTags.length) {
    try {
      const sameDayReleaseCommit = execSync(
        `git log --format=%H --grep='^ci: release$' --since='${dates.date} 00:00:00' --until='${dates.date} 23:59:59' -- packages/*/CHANGELOG.md`,
        { encoding: 'utf-8' },
      )
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean);

      if (sameDayReleaseCommit) {
        snapshotTags.push(...getSnapshotReleaseTagsFromCommit(sameDayReleaseCommit));
      }
    } catch {
      // Fallback to ancestry-based release lookup below.
    }
  }

  if (!snapshotTags.length) {
    try {
      const tagCommit = execSync(`git rev-parse ${tag}^{commit}`, { encoding: 'utf-8' }).trim();
      const latestReleaseCommit = execSync(
        `git rev-list -n 1 ${tagCommit} -- packages/*/CHANGELOG.md`,
        { encoding: 'utf-8' },
      ).trim();
      if (latestReleaseCommit) {
        snapshotTags.push(...getSnapshotReleaseTagsFromCommit(latestReleaseCommit));
      }
    } catch {
      // Fallback to root CHANGELOG parsing below.
    }
  }
  if (snapshotTags.length) {
    return snapshotTags;
  }

  try {
    const changelog = fs.readFileSync('CHANGELOG.md', 'utf-8');
    const dateMatches = Array.from(changelog.matchAll(changelogDateHeadingPattern));
    const dateIndex = dateMatches.findIndex((match) => match[1] === dates.date);
    if (dateIndex === -1) {
      return [];
    }

    const sectionStart = dateMatches[dateIndex]!.index ?? 0;
    const sectionEnd =
      dateIndex + 1 < dateMatches.length
        ? (dateMatches[dateIndex + 1]!.index ?? changelog.length)
        : changelog.length;
    const section = changelog.slice(sectionStart, sectionEnd);

    return Array.from(section.matchAll(changelogPackageHeadingPattern)).flatMap((match) => {
      const packageName = match[1];
      const version = match[2];
      if (!packageName || !version) {
        return [];
      }

      return [
        {
          date: dates.date,
          packageName,
          timestamp: dates.timestamp,
          version,
        },
      ];
    });
  } catch {
    return [];
  }
}

function setReleaseTag(results: Map<string, ReleaseTag>, tag: ReleaseTag): void {
  const key = `${tag.date}:${tag.packageName}:${tag.version}`;
  const existing = results.get(key);
  if (!existing || tag.timestamp > existing.timestamp) {
    results.set(key, tag);
  }
}

export function getGitTags(): Array<ReleaseTag> {
  try {
    const tags = getAllTags();
    const packages = getChangelogPackages();
    const legacyTagPackage = packages.find((pkg) => pkg.name === LEGACY_TAG_PACKAGE)?.name;
    const packageNamesByChangelogPath = new Map(
      packages
        .map((pkg) => {
          const changelogPath = pkg.changelogPath ?? path.join(pkg.path, 'CHANGELOG.md');
          return [path.relative(process.cwd(), path.resolve(changelogPath)), pkg.name] as const;
        })
        .filter(([relativeChangelogPath]) => relativeChangelogPath.endsWith('CHANGELOG.md')),
    );

    const results = new Map<string, ReleaseTag>();
    for (const tag of tags) {
      if (tag.match(releaseDatePattern)) {
        const dates = getTagDates(tag);
        for (const releaseTag of getSnapshotReleaseTags(dates, tag, packageNamesByChangelogPath)) {
          setReleaseTag(results, releaseTag);
        }
        continue;
      }

      // Match pattern: <package-name>@<version> (e.g., @hey-api/types@0.1.4)
      const packageTagMatch = tag.match(packageTagPattern);
      if (packageTagMatch) {
        const packageName = packageTagMatch[1];
        const version = packageTagMatch[2];
        if (!packageName || !version) continue;

        const releaseTag = {
          ...getTagDates(tag),
          packageName,
          version,
        };
        setReleaseTag(results, releaseTag);
        continue;
      }

      if (legacyTagPackage) {
        // Match legacy pattern: v<version> (e.g., v0.29.0)
        const legacyTagMatch = tag.match(legacyTagPattern);
        if (legacyTagMatch) {
          const version = legacyTagMatch[1];
          if (!version) continue;

          const releaseTag = {
            ...getTagDates(tag),
            packageName: legacyTagPackage,
            version,
          };
          setReleaseTag(results, releaseTag);
          continue;
        }
      }
    }

    return Array.from(results.values());
  } catch {
    return [];
  }
}
