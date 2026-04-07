import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { repo } from '../config';
import type { ParsedEntry, ReleaseGroup, ReleasePackage } from './grouper';
import { groupByRelease, isFlagshipPackage } from './grouper';
import { readAllPackageChangelogs } from './reader';

const sectionOrder: Array<'Breaking' | 'Core' | 'Plugins' | 'Other'> = [
  'Breaking',
  'Core',
  'Plugins',
  'Other',
];

function transformScope(scope: string | undefined): string {
  if (!scope) return '';
  if (scope.startsWith('plugin(') && scope.endsWith(')')) {
    return scope.slice(7, -1);
  }
  return scope;
}

function transformDescription(description: string): string {
  return description.replace(/^fix:\s*/i, '');
}

function formatEntry(entry: ParsedEntry, options?: { hideScope?: boolean }): string {
  const displayScope = entry.scope ? transformScope(entry.scope) : undefined;
  const [firstLine = '', ...bodyLines] = entry.description.split('\n');
  const displayDescription = transformDescription(firstLine);
  const hideScope = options?.hideScope === true;

  let header =
    displayScope && !hideScope ? `${displayScope}: ${displayDescription}` : displayDescription;
  if (entry.prNumber) {
    header += ` ([#${entry.prNumber}](https://github.com/${repo}/pull/${entry.prNumber}))`;
  }

  if (!bodyLines.length) {
    return `- ${header}`;
  }

  return `- ${header}\n${bodyLines.join('\n')}`;
}

function formatPackageBlock(pkg: ReleasePackage): string {
  const lines: Array<string> = [];

  lines.push(`## ${pkg.packageName} ${pkg.version}\n`);

  if (!pkg.hasUserFacingChanges) {
    lines.push('No user-facing changes.\n');
    return lines.join('\n');
  }

  if (!pkg.entries.length) {
    lines.push('(No parsed entries)\n');
    return lines.join('\n');
  }

  const entriesByCategory: Map<string, Array<ParsedEntry>> = new Map();

  for (const entry of pkg.entries) {
    if (!entriesByCategory.has(entry.category)) {
      entriesByCategory.set(entry.category, []);
    }
    entriesByCategory.get(entry.category)!.push(entry);
  }

  const categoryOrder: Array<string> = ['Breaking', 'Added', 'Fixed', 'Changed'];

  if (isFlagshipPackage(pkg.packageName)) {
    const sectionEntries: Map<string, Array<ParsedEntry>> = new Map();

    for (const entry of pkg.entries) {
      const section = entry.section || 'Core';
      if (!sectionEntries.has(section)) {
        sectionEntries.set(section, []);
      }
      sectionEntries.get(section)!.push(entry);
    }

    const breakingEntries = entriesByCategory.get('Breaking') ?? [];

    if (breakingEntries.length) {
      lines.push('### ⚠️ Breaking');
      for (const entry of breakingEntries) {
        lines.push(formatEntry(entry));
      }
      lines.push('');
    }

    for (const section of sectionOrder) {
      const entriesWithCategory = sectionEntries.get(section);
      if (!entriesWithCategory?.length) continue;

      if (section === 'Plugins') {
        const pluginEntries: Map<string, Array<ParsedEntry>> = new Map();

        for (const entry of entriesWithCategory) {
          const pluginName = transformScope(entry.scope);
          if (!pluginEntries.has(pluginName)) {
            pluginEntries.set(pluginName, []);
          }
          pluginEntries.get(pluginName)!.push(entry);
        }

        const sortedPlugins = Array.from(pluginEntries.keys()).sort();

        lines.push(`### ${section}\n`);

        for (const pluginName of sortedPlugins) {
          lines.push(`#### ${pluginName}\n`);

          const pluginCategoryEntries = pluginEntries.get(pluginName)!;
          pluginCategoryEntries.sort((a, b) => {
            const catOrder = { Added: 1, Breaking: 0, Changed: 3, Fixed: 2 };
            return (
              (catOrder[a.category as keyof typeof catOrder] ?? 3) -
              (catOrder[b.category as keyof typeof catOrder] ?? 3)
            );
          });

          let lastCategory = '';
          for (const entry of pluginCategoryEntries) {
            if (entry.category !== lastCategory) {
              // lines.push(`###### ${entry.category}`);
              lastCategory = entry.category;
            }
            lines.push(formatEntry(entry, { hideScope: true }));
          }

          lines.push('');
        }
      } else {
        entriesWithCategory.sort((a, b) => {
          const scopeA = a.scope ? transformScope(a.scope) : '';
          const scopeB = b.scope ? transformScope(b.scope) : '';
          const cmp = scopeA.localeCompare(scopeB);
          if (cmp !== 0) return cmp;
          const catOrder = { Added: 1, Breaking: 0, Changed: 3, Fixed: 2 };
          return (
            (catOrder[a.category as keyof typeof catOrder] ?? 3) -
            (catOrder[b.category as keyof typeof catOrder] ?? 3)
          );
        });

        if (section === 'Breaking') {
          lines.push('### ⚠️ Breaking\n');
        } else if (section !== 'Other') {
          lines.push(`### ${section}\n`);
        }

        for (const entry of entriesWithCategory) {
          lines.push(formatEntry(entry));
        }

        lines.push('');
      }
    }
  } else {
    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory.get(category);
      if (!categoryEntries?.length) continue;

      categoryEntries.sort((a, b) => {
        const scopeA = a.scope ? transformScope(a.scope) : '';
        const scopeB = b.scope ? transformScope(b.scope) : '';
        return scopeA.localeCompare(scopeB);
      });

      if (category === 'Breaking') {
        lines.push('### ⚠️ Breaking\n');
      } else {
        lines.push(`### ${category}\n`);
      }

      for (const entry of categoryEntries) {
        lines.push(formatEntry(entry));
      }

      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

function formatRootChangelog(releaseGroups: Array<ReleaseGroup>): string {
  const lines: Array<string> = ['# Changelog\n'];

  for (const group of releaseGroups) {
    lines.push(`# ${group.date}\n`);

    for (const pkg of group.packages) {
      lines.push(`${formatPackageBlock(pkg)}\n`, '<br>\n<br>\n');
    }
  }

  return lines.join('\n').trim();
}

async function assembleRootChangelog(): Promise<string> {
  const changelogs = readAllPackageChangelogs();
  const groups = groupByRelease(changelogs);
  // fs.writeFileSync('DEBUG_CHANGELOG.json', `${JSON.stringify(groups, null, 2)}\n`, 'utf-8');
  return formatRootChangelog(groups);
}

async function writeRootChangelog(): Promise<void> {
  const content = await assembleRootChangelog();
  fs.writeFileSync('CHANGELOG.md', content, 'utf-8');
  console.log('✓ Synced CHANGELOG.md');
}

const isMain =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isMain) {
  writeRootChangelog().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
