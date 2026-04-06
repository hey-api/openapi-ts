import { getInfo, getInfoFromPullRequest } from '@changesets/get-github-info';

/**
 * @returns {string}
 */
function getRepo() {
  return 'hey-api/openapi-ts';
}

/** @type {import("@changesets/types").ChangelogFunctions} */
export default {
  getDependencyReleaseLine: async (_, dependenciesUpdated) => {
    if (!dependenciesUpdated.length) {
      return '';
    }

    const list = dependenciesUpdated.map(
      (dependency) => `  - ${dependency.name}@${dependency.newVersion}`,
    );

    return ['### Updated Dependencies:', ...list].join('\n');
  },
  getReleaseLine: async (changeset) => {
    const repo = getRepo();

    /** @type number | undefined */
    let prFromSummary;
    /** @type string | undefined */
    let commitFromSummary;
    /** @type string[] */
    const usersFromSummary = [];

    // Parse summary to extract scope and description
    const summary = changeset.summary;

    // Remove PR, commit, author/user lines from summary
    const replacedChangelog = summary
      .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
        const num = Number(pr);
        if (!Number.isNaN(num)) {
          prFromSummary = num;
        }
        return '';
      })
      .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
        commitFromSummary = commit;
        return '';
      })
      .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
        usersFromSummary.push(user);
        return '';
      })
      .trim();

    // Detect scope from **scope**: format
    const scopeMatch = replacedChangelog.match(/^\*\*([^:]+)\*\*:?\s*(.*)$/);
    const scope = scopeMatch ? scopeMatch[1] : null;
    const description = scopeMatch ? scopeMatch[2] : replacedChangelog;

    // Detect breaking changes (explicit BREAKING or major version) - for future use
    const explicitBreaking =
      /^BREAKING[:\s]/i.test(replacedChangelog) || /\bBREAKING CHANGE\b/i.test(replacedChangelog);
    void explicitBreaking;

    // Build formatted entry
    const entryParts = [];
    if (scope) {
      entryParts.push(`**${scope}**: ${description}`);
    } else {
      entryParts.push(description);
    }

    const links = await (async () => {
      if (prFromSummary !== undefined) {
        let { links } = await getInfoFromPullRequest({
          pull: prFromSummary,
          repo,
        });
        if (commitFromSummary) {
          const shortCommitId = commitFromSummary.slice(0, 7);
          links = {
            ...links,
            commit: `[\`${shortCommitId}\`](https://github.com/${repo}/commit/${commitFromSummary})`,
          };
        }
        return links;
      }
      const commitToFetchFrom = commitFromSummary || changeset.commit;
      if (commitToFetchFrom) {
        let { links } = await getInfo({ commit: commitToFetchFrom, repo });
        const shortCommitId = commitToFetchFrom.slice(0, 7);
        links = {
          ...links,
          commit: `[\`${shortCommitId}\`](https://github.com/${repo}/commit/${commitToFetchFrom})`,
        };
        return links;
      }
      return {
        commit: null,
        pull: null,
        user: null,
      };
    })();

    // Add PR link at end
    if (links.pull) {
      entryParts.push(`(${links.pull})`);
    } else if (prFromSummary !== undefined) {
      entryParts.push(`([#${prFromSummary}](https://github.com/${repo}/pull/${prFromSummary}))`);
    }

    return `\n- ${entryParts.join(' ')}`;
  },
};
