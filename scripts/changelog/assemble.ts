import fs from 'node:fs';

import { isExecutedDirectly, isFlagshipPackage, repo, writeDebugFile } from './config';
import { getDateRangeFilterFromEnv } from './date-filter';
import { readAllPackageChangelogs } from './reader';
import { createReleases } from './releases';
import type { ChangelogEntry, EntryCategory, EntrySection, Release, ReleasePackage } from './types';

const categoryOrder: Array<EntryCategory> = ['Breaking', 'Added', 'Fixed', 'Changed'];

const sectionOrder: Array<EntrySection> = ['Breaking', 'Core', 'Plugins', 'Other'];

function transformScope(scope: string | undefined): string {
  if (!scope) return '';
  if (scope.startsWith('plugin(') && scope.endsWith(')')) {
    return scope.slice(7, -1);
  }
  return scope;
}

function formatEntry(entry: ChangelogEntry, options?: { hideScope?: boolean }): string {
  const displayScope = entry.scope ? transformScope(entry.scope) : undefined;
  const [firstLine = '', ...bodyLines] = entry.description.split('\n');
  const displayDescription = firstLine.replace(/^fix:\s*/i, '');
  const hideScope = options?.hideScope === true;

  let header =
    displayScope && !hideScope ? `${displayScope}: ${displayDescription}` : displayDescription;
  if (entry.category === 'Breaking') {
    header = `**⚠️ Breaking:** ${header}`;
  }
  if (entry.pullRequest !== undefined) {
    header += ` ([#${entry.pullRequest}](https://github.com/${repo}/pull/${entry.pullRequest}))`;
  }

  if (!bodyLines.length) {
    return `- ${header}`;
  }

  return `- ${header}\n${bodyLines.join('\n')}`;
}

export function formatReleasePackage(pkg: ReleasePackage, lines: Array<string> = []): void {
  lines.push(`## ${pkg.packageName} ${pkg.version}`, '');

  if (!pkg.hasUserFacingChanges) {
    lines.push('No user-facing changes.', '');
    return;
  }

  if (!pkg.entries.length) {
    lines.push('(No parsed entries)', '');
    return;
  }

  const entriesByCategory: Map<EntryCategory, Array<ChangelogEntry>> = new Map();
  for (const entry of pkg.entries) {
    if (!entriesByCategory.has(entry.category)) {
      entriesByCategory.set(entry.category, []);
    }
    entriesByCategory.get(entry.category)!.push(entry);
  }

  const breakingEntries = entriesByCategory.get('Breaking') ?? [];
  if (breakingEntries.length) {
    lines.push('### ⚠️ Breaking', '');
    const count = breakingEntries.length;
    lines.push(
      `This release has ${count} breaking ${count === 1 ? 'change' : 'changes'}. Please review the release notes carefully before upgrading.`,
    );
    lines.push('');
  }

  if (!isFlagshipPackage(pkg.packageName)) {
    const updateEntries = [
      ...(entriesByCategory.get('Breaking') ?? []),
      ...(entriesByCategory.get('Added') ?? []),
      ...(entriesByCategory.get('Fixed') ?? []),
      ...(entriesByCategory.get('Changed') ?? []),
    ].sort((a, b) => {
      const categoryCompare =
        (categoryOrder.indexOf(a.category) ?? Number.MAX_SAFE_INTEGER) -
        (categoryOrder.indexOf(b.category) ?? Number.MAX_SAFE_INTEGER);
      if (categoryCompare !== 0) return categoryCompare;

      const scopeA = a.scope ? transformScope(a.scope) : '';
      const scopeB = b.scope ? transformScope(b.scope) : '';
      const scopeCompare = scopeA.localeCompare(scopeB);
      if (scopeCompare !== 0) return scopeCompare;
      return a.description.localeCompare(b.description);
    });

    if (updateEntries.length) {
      lines.push('### Updates', '');
      for (const entry of updateEntries) {
        lines.push(formatEntry(entry));
      }
      lines.push('');
    }

    return;
  }

  const entriesBySection: Map<EntrySection, Array<ChangelogEntry>> = new Map();
  for (const entry of pkg.entries) {
    const section = entry.section || 'Core';
    if (!entriesBySection.has(section)) {
      entriesBySection.set(section, []);
    }
    entriesBySection.get(section)!.push(entry);
  }

  for (const section of sectionOrder) {
    const sectionEntries = entriesBySection.get(section) ?? [];
    if (!sectionEntries.length) continue;

    if (section === 'Plugins') {
      const entriesByPlugin: Map<string, Array<ChangelogEntry>> = new Map();

      for (const entry of sectionEntries) {
        const pluginName = transformScope(entry.scope);
        if (!entriesByPlugin.has(pluginName)) {
          entriesByPlugin.set(pluginName, []);
        }
        entriesByPlugin.get(pluginName)!.push(entry);
      }

      lines.push(`### ${section}`, '');

      const sortedPlugins = Array.from(entriesByPlugin.keys()).sort();
      for (const pluginName of sortedPlugins) {
        lines.push(`#### ${pluginName}`, '');

        const pluginEntries = entriesByPlugin.get(pluginName) ?? [];
        pluginEntries.sort(
          (a, b) =>
            (categoryOrder.indexOf(a.category) ?? Number.MAX_SAFE_INTEGER) -
            (categoryOrder.indexOf(b.category) ?? Number.MAX_SAFE_INTEGER),
        );

        let lastCategory = '';
        for (const entry of pluginEntries) {
          if (entry.category !== lastCategory) {
            lastCategory = entry.category;
          }
          lines.push(formatEntry(entry, { hideScope: true }));
        }

        lines.push('');
      }
    } else {
      sectionEntries.sort((a, b) => {
        const scopeA = a.scope ? transformScope(a.scope) : '';
        const scopeB = b.scope ? transformScope(b.scope) : '';
        const scopeCompare = scopeA.localeCompare(scopeB);
        if (scopeCompare !== 0) return scopeCompare;
        return (
          (categoryOrder.indexOf(a.category) ?? Number.MAX_SAFE_INTEGER) -
          (categoryOrder.indexOf(b.category) ?? Number.MAX_SAFE_INTEGER)
        );
      });

      const sectionHeading = section === 'Breaking' ? '⚠️ Breaking' : 'Updates';
      lines.push(`### ${sectionHeading}`, '');

      for (const entry of sectionEntries) {
        lines.push(formatEntry(entry));
      }

      lines.push('');
    }
  }
}

function formatChangelog(releases: Array<Release>): string {
  const lines: Array<string> = ['# Changelog', ''];
  for (const [releaseIndex, release] of releases.entries()) {
    lines.push(`# ${release.date}`, '');
    for (const [packageIndex, pkg] of release.packages.entries()) {
      formatReleasePackage(pkg, lines);

      const isLastRelease = releaseIndex === releases.length - 1;
      const isLastPackage = packageIndex === release.packages.length - 1;

      if (!isLastRelease || !isLastPackage) {
        lines.push('---', '');
      }
    }
  }
  return lines.join('\n');
}

async function assembleRootChangelog(): Promise<string> {
  const changelogs = readAllPackageChangelogs();
  const dateRange = getDateRangeFilterFromEnv();
  const releases = createReleases(changelogs, { dateRange });

  writeDebugFile('CHANGELOG.json', () => JSON.stringify(releases, null, 2));

  return formatChangelog(releases);
}

if (isExecutedDirectly(import.meta.url)) {
  assembleRootChangelog()
    .then((content) => {
      fs.writeFileSync('CHANGELOG.md', content, 'utf-8');
      console.log('✓ Synced CHANGELOG.md');
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
