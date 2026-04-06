import { groupByRelease } from '../assemble/grouper.js';
import { readAllPackageChangelogs } from '../assemble/reader.js';
import { extractContributors } from './contributors.js';
import { formatReleaseNotes } from './format.js';

async function getAllPrNumbers(
  changelogs: ReturnType<typeof readAllPackageChangelogs>,
): Promise<Array<number>> {
  const prNumbers = new Set<number>();

  for (const changelog of changelogs.values()) {
    for (const version of changelog.versions) {
      const matches = version.content.match(/#(\d+)/g);
      if (matches) {
        for (const match of matches) {
          const num = parseInt(match.slice(1), 10);
          if (!Number.isNaN(num)) {
            prNumbers.add(num);
          }
        }
      }
    }
  }

  return Array.from(prNumbers);
}

export async function generateReleaseNotes(): Promise<string> {
  const changelogs = readAllPackageChangelogs();
  const groups = groupByRelease(changelogs);

  if (groups.length === 0) {
    return 'No releases found.';
  }

  // Get the latest release
  const latest = groups[0];

  // Get all PR numbers from the latest release for contributor extraction
  const prNumbers = await getAllPrNumbers(changelogs);
  const contributors = await extractContributors(prNumbers);

  const release = formatReleaseNotes(latest, contributors);

  return release.body;
}
