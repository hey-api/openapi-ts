import { getChangelogPackages, isFlagshipPackage } from './config';
import type { DateRangeFilter } from './date-filter';
import { extractChangelogEntries } from './entries';
import type { Changelogs } from './reader';
import { getGitTags } from './tags';
import type { Release, ReleasePackage, ReleaseTag } from './types';

export interface CreateReleasesOptions {
  dateRange?: DateRangeFilter;
}

function getPackageGroupRank(packageName: string): number {
  return isFlagshipPackage(packageName) ? 0 : 1;
}

export function createReleases(
  changelogs: Changelogs,
  options: CreateReleasesOptions = {},
): Array<Release> {
  const tags = getGitTags();

  const tagsByDate = new Map<string, Array<ReleaseTag>>();
  for (const tag of tags) {
    if (!tagsByDate.has(tag.date)) {
      tagsByDate.set(tag.date, []);
    }
    tagsByDate.get(tag.date)!.push(tag);
  }

  const sortedDates = Array.from(tagsByDate.keys()).sort((a, b) => {
    const aLatest = Math.max(...tagsByDate.get(a)!.map((tag) => tag.timestamp));
    const bLatest = Math.max(...tagsByDate.get(b)!.map((tag) => tag.timestamp));
    if (aLatest === bLatest) return b.localeCompare(a);
    return bLatest - aLatest;
  });

  const { dateRange } = options;
  const filteredDates = dateRange
    ? sortedDates.filter((date) => date >= dateRange.startDate && date <= dateRange.endDate)
    : sortedDates;

  const packageNames = new Set(getChangelogPackages().map((pkg) => pkg.name));
  const releases: Array<Release> = [];

  for (const date of filteredDates) {
    const sortedPackages = tagsByDate
      .get(date)!
      .filter((tag) => packageNames.has(tag.packageName))
      .sort((a, b) => {
        const aGroup = getPackageGroupRank(a.packageName);
        const bGroup = getPackageGroupRank(b.packageName);
        if (aGroup !== bGroup) return aGroup - bGroup;

        const nameCompare = a.packageName.localeCompare(b.packageName);
        if (nameCompare !== 0) return nameCompare;

        return b.timestamp - a.timestamp;
      });

    const packages: Array<ReleasePackage> = [];

    for (const tag of sortedPackages) {
      const changelog = changelogs.get(tag.packageName);
      if (!changelog) continue;

      const release = changelog.releases.find((release) => release.version === tag.version);
      if (!release) continue;

      packages.push({
        content: release.content,
        entries: extractChangelogEntries(release.content),
        hasUserFacingChanges: release.hasUserFacingChanges,
        packageName: tag.packageName,
        version: tag.version,
      });
    }

    if (packages.length) {
      releases.push({ date, packages });
    }
  }

  return releases;
}
