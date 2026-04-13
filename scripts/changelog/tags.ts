import { execSync } from 'node:child_process';

import { getChangelogPackages, LEGACY_TAG_PACKAGE } from './config';
import { getAllTags } from './release-tag';
import type { ReleaseTag } from './types';

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

export function getGitTags(): Array<ReleaseTag> {
  try {
    const tags = getAllTags();
    const packages = getChangelogPackages();
    const legacyTagPackage = packages.find((pkg) => pkg.name === LEGACY_TAG_PACKAGE)?.name;

    const results: Array<ReleaseTag> = [];
    for (const tag of tags) {
      // Match pattern: <package-name>@<version> (e.g., @hey-api/types@0.1.4)
      const packageTagMatch = tag.match(/^(.+)@(\d+\.\d+\.\d+)$/);
      if (packageTagMatch) {
        results.push({
          ...getTagDates(tag),
          packageName: packageTagMatch[1],
          version: packageTagMatch[2],
        });

        continue;
      }

      if (legacyTagPackage) {
        // Match legacy pattern: v<version> (e.g., v0.29.0)
        const legacyTagMatch = tag.match(/^v(\d+\.\d+\.\d+)$/);
        if (legacyTagMatch) {
          results.push({
            ...getTagDates(tag),
            packageName: legacyTagPackage,
            version: legacyTagMatch[1],
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}
