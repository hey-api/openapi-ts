import { getInfo, getInfoFromPullRequest } from "@changesets/get-github-info";
import { config } from "dotenv";

config();

/**
 * @returns {string}
 */
function getRepo() {
  return 'hey-api/openapi-ts';
}

/** @type {import("@changesets/types").ChangelogFunctions} */
export default {
  getDependencyReleaseLine: async (changesets, dependenciesUpdated) => {
    if (!dependenciesUpdated.length) {
      return '';
    }

    const list = dependenciesUpdated.map((dependency) => `  - ${dependency.name}@${dependency.newVersion}`);

    return ['### Updated Dependencies:', ...list].join("\n");
  },
  getReleaseLine: async (changeset) => {
    const repo = getRepo();

    /** @type number | undefined */
    let prFromSummary;
    /** @type string | undefined */
    let commitFromSummary;
    /** @type string[] */
    const usersFromSummary = [];

    const replacedChangelog = changeset.summary
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
        const { links } = await getInfo({
          commit: commitToFetchFrom,
          repo,
        });
        return links;
      }
      return {
        commit: null,
        pull: null,
        user: null,
      };
    })();

    const users = usersFromSummary.length
      ? usersFromSummary
          .map(
            (userFromSummary) =>
              `[@${userFromSummary}](https://github.com/${userFromSummary})`
          )
          .join(", ")
      : links.user;

    const metadata = [
      links.pull === null ? '' : ` (${links.pull})`,
      links.commit === null ? '' : ` (${links.commit})`,
      users === null ? '' : ` by ${users}`,
    ].join('');

    return `\n- ${replacedChangelog}${metadata}`;
  },
};
