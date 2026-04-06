import { writeFileSync } from 'node:fs';

import { groupByRelease, type ParsedEntry, type ReleaseGroup } from './grouper.js';
import { readAllPackageChangelogs } from './reader.js';

const sectionOrder: Array<'Breaking' | 'Core' | 'Plugins' | 'Other'> = [
  'Breaking',
  'Core',
  'Plugins',
  'Other',
];

const IS_OPENAPI_TS = '@hey-api/openapi-ts';

function transformScope(scope: string | null): string {
  if (!scope) return '';
  if (scope.startsWith('plugin(') && scope.endsWith(')')) {
    return scope.slice(7, -1);
  }
  return scope;
}

function transformDescription(description: string): string {
  return description.replace(/^fix:\s*/i, '');
}

function formatEntry(entry: ParsedEntry): string {
  const parts: Array<string> = [];

  const displayScope = entry.scope ? transformScope(entry.scope) : null;
  const displayDescription = transformDescription(entry.description);

  if (displayScope) {
    parts.push(`**${displayScope}**: ${displayDescription}`);
  } else {
    parts.push(displayDescription);
  }

  if (entry.prNumber) {
    parts.push(
      `([#${entry.prNumber}](https://github.com/hey-api/openapi-ts/pull/${entry.prNumber}))`,
    );
  }

  return `- ${parts.join(' ')}`;
}

function formatPackageBlock(pkg: ReleaseGroup['packages'][number]): string {
  const lines: Array<string> = [];
  const useSections = pkg.name === IS_OPENAPI_TS;

  lines.push(`### @hey-api/${pkg.name.replace('@hey-api/', '')} ${pkg.version}`);
  lines.push('');

  if (!pkg.hasUserFacingChanges) {
    lines.push('No user-facing changes.');
    lines.push('');
    return lines.join('\n');
  }

  if (pkg.entries.length === 0) {
    lines.push('(No parsed entries)');
    lines.push('');
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

  if (useSections) {
    const sectionEntries: Map<string, Array<{ category: string, entry: ParsedEntry; }>> = new Map();

    for (const entry of pkg.entries) {
      if (!sectionEntries.has(entry.section)) {
        sectionEntries.set(entry.section, []);
      }
      sectionEntries.get(entry.section)!.push({ category: entry.category, entry });
    }

    const breakingEntries = entriesByCategory.get('Breaking') ?? [];

    if (breakingEntries.length > 0) {
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
        const pluginEntries: Map<
          string,
          Array<{ category: string, entry: ParsedEntry; }>
        > = new Map();

        for (const { category, entry } of entriesWithCategory) {
          const pluginName = transformScope(entry.scope);
          if (!pluginEntries.has(pluginName)) {
            pluginEntries.set(pluginName, []);
          }
          pluginEntries.get(pluginName)!.push({ category, entry });
        }

        const sortedPlugins = Array.from(pluginEntries.keys()).sort();

        for (const pluginName of sortedPlugins) {
          lines.push(`#### ${pluginName}`);

          const pluginCategoryEntries = pluginEntries.get(pluginName)!;
          pluginCategoryEntries.sort((a, b) => {
            const catOrder = { Added: 1, Breaking: 0, Changed: 3, Fixed: 2 };
            return (
              (catOrder[a.category as keyof typeof catOrder] ?? 3) -
              (catOrder[b.category as keyof typeof catOrder] ?? 3)
            );
          });

          let lastCategory = '';
          for (const { category, entry } of pluginCategoryEntries) {
            if (category !== lastCategory) {
              lines.push(`###### ${category}`);
              lastCategory = category;
            }
            lines.push(formatEntry(entry));
          }

          lines.push('');
        }
      } else {
        entriesWithCategory.sort((a, b) => {
          const scopeA = a.entry.scope ? transformScope(a.entry.scope) : '';
          const scopeB = b.entry.scope ? transformScope(b.entry.scope) : '';
          const cmp = scopeA.localeCompare(scopeB);
          if (cmp !== 0) return cmp;
          const catOrder = { Added: 1, Breaking: 0, Changed: 3, Fixed: 2 };
          return (
            (catOrder[a.category as keyof typeof catOrder] ?? 3) -
            (catOrder[b.category as keyof typeof catOrder] ?? 3)
          );
        });

        if (section === 'Breaking') {
          lines.push('#### ⚠️ Breaking');
        } else if (section !== 'Other') {
          lines.push(`#### ${section}`);
        }

        for (const { entry } of entriesWithCategory) {
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
        lines.push('### ⚠️ Breaking');
      } else {
        lines.push(`### ${category}`);
      }

      for (const entry of categoryEntries) {
        lines.push(formatEntry(entry));
      }

      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

export function formatRootChangelog(releaseGroups: ReturnType<typeof groupByRelease>): string {
  const lines: Array<string> = [];

  lines.push('# Changelog');
  lines.push('');

  for (const group of releaseGroups) {
    lines.push(`## ${group.date}`);
    lines.push('');

    for (const pkg of group.packages) {
      lines.push(formatPackageBlock(pkg));
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

export async function assembleRootChangelog(): Promise<string> {
  const changelogs = readAllPackageChangelogs();
  const groups = groupByRelease(changelogs);
  return formatRootChangelog(groups);
}

export async function writeRootChangelog(): Promise<void> {
  const content = await assembleRootChangelog();
  writeFileSync('CHANGELOG.md', content, 'utf-8');
}
