import type { ChangelogFunctions } from '@changesets/types';

import type { SemverType } from './config.js';
import { getReleaseLine } from './format.js';

const changelogFunctions: ChangelogFunctions = {
  getDependencyReleaseLine: async () => '',
  getReleaseLine: async (changeset, type, options) => {
    const semverType = (type === 'none' ? 'patch' : type) as SemverType;
    return getReleaseLine(
      {
        releases: changeset.releases?.map((r) => ({
          name: r.name,
          type: r.type === 'none' ? 'patch' : (r.type as SemverType),
        })),
        summary: changeset.summary,
      },
      semverType,
      options ?? {},
    );
  },
};

export default changelogFunctions;
