import path from 'node:path';
import url from 'node:url';

import type { ReleaseGroup } from '../assemble/grouper';
import { groupByRelease } from '../assemble/grouper';
import { readAllPackageChangelogs } from '../assemble/reader';
import { getContributorsFromPullRequests } from './contributors';
import { formatReleaseNotes } from './format';

function getPrNumbersFromRelease(release: ReleaseGroup): Array<number> {
  const prNumbers = new Set<number>();

  for (const pkg of release.packages) {
    for (const entry of pkg.entries) {
      if (entry.prNumber !== undefined) {
        prNumbers.add(entry.prNumber);
      }
    }
  }

  return Array.from(prNumbers);
}

export async function generateReleaseNotes(): Promise<string> {
  const changelogs = readAllPackageChangelogs();
  const groups = groupByRelease(changelogs);

  if (!groups.length) {
    return 'No releases found.';
  }

  const latest = groups[0];

  const prNumbers = getPrNumbersFromRelease(latest);
  const contributors = await getContributorsFromPullRequests(prNumbers);
  const release = formatReleaseNotes(latest, contributors);
  return release.body;
}

const isMain =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url);

if (isMain) {
  generateReleaseNotes()
    .then((notes) => {
      process.stdout.write(`${notes}\n`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
