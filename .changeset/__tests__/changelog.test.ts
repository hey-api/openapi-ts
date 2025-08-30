import type * as getGitHubInfo from '@changesets/get-github-info';
import parse from '@changesets/parse';
import type { ModCompWithPackage, NewChangesetWithCommit, VersionType } from "@changesets/types";
import { describe, expect, it, vi } from "vitest";

import changelog from "../changelog.js";

type GetGitHubInfo = typeof getGitHubInfo;

const data = {
	commit: 'a085003',
	pull: 1613,
	repo: 'hey-api/openapi-ts',
  user: 'someone',
};

vi.mock("@changesets/get-github-info", (): GetGitHubInfo => ({
  async getInfo({ commit, repo }) {
    const { pull, user } = data;
    const links = {
      commit: `[\`${commit}\`](https://github.com/${repo}/commit/${commit})`,
      pull: `[#${pull}](https://github.com/${repo}/pull/${pull})`,
      user: `[@${user}](https://github.com/${user})`
    };
    return {
      links,
      pull,
      user,
    };
  },
  async getInfoFromPullRequest({ pull, repo }) {
    const { commit, user } = data;
    const links = {
      commit: `[\`${commit}\`](https://github.com/${repo}/commit/${commit})`,
      pull: `[#${pull}](https://github.com/${repo}/pull/${pull})`,
      user: `[@${user}](https://github.com/${user})`
    };
    return {
      commit,
      links,
      user,
    };
  },
}));

const getChangeset = (content: string, commit: string | undefined): [
  NewChangesetWithCommit,
  VersionType,
  null | Record<string, any>,
] => [
  {
    ...parse(
      `---
pkg: "minor"
---

something
${content}
`
    ),
    commit,
    id: 'some-id'
  },
  'minor',
  { repo: data.repo }
];

describe("changelog", () => {
  it("formats dependency release lines", async () => {
    const changesets: NewChangesetWithCommit[] = [
      {
        commit: "abc123",
        id: "fake-id",
        releases: [],
        summary: "update deps",
      },
    ];
    const deps: ModCompWithPackage[] = [
      {
        changesets: ["fake-id"],
        dir: "/fake/path",
        name: "@hey-api/openapi-ts",
        newVersion: "0.0.2",
        oldVersion: "0.0.1",
        packageJson: {
          name: "@hey-api/openapi-ts",
          version: "0.0.1",
        },
        type: "patch",
      },
    ];

    const line = await changelog.getDependencyReleaseLine(
      changesets,
      deps,
      { repo: "org/repo" }
    );

    expect(line).toEqual("### Updated Dependencies:\n  - @hey-api/openapi-ts@0.0.2");
  });

  it("formats regular release lines", async () => {
    const changeset: NewChangesetWithCommit = {
      commit: "abc123",
      id: "fake-id",
      releases: [],
      summary: "Fixed bug in parser",
    };

    const line = await changelog.getReleaseLine(changeset, "patch", {
      repo: "org/repo",
    });

    expect(line).toContain("Fixed bug in parser");
    expect(line).toContain("abc123");
  });

  it('with multiple authors', async () => {
    expect(
      await changelog.getReleaseLine(
        ...getChangeset(['author: @one', 'author: @two'].join('\n'), data.commit)
      )
    ).toEqual(`\n- something ([#1613](https://github.com/hey-api/openapi-ts/pull/1613)) ([\`a085003\`](https://github.com/hey-api/openapi-ts/commit/a085003)) by [@one](https://github.com/one), [@two](https://github.com/two)`);
  });

  describe.each(['author', 'user'])('override author with %s keyword', (keyword) => {
    it.each(['with @', 'without @'])('%s', async (kind) => {
      expect(
        await changelog.getReleaseLine(
          ...getChangeset(`${keyword}: ${kind === 'with @' ? '@' : ''}other`, data.commit)
        )
      ).toEqual(`\n- something ([#1613](https://github.com/hey-api/openapi-ts/pull/1613)) ([\`a085003\`](https://github.com/hey-api/openapi-ts/commit/a085003)) by [@other](https://github.com/other)`);
    });
  });

  describe.each([data.commit, 'wrongcommit', undefined])('with commit from changeset of %s', (commitFromChangeset) => {
    describe.each(['pr', 'pull request', 'pull'])('override pr with %s keyword', (keyword) => {
      it.each(['with #', 'without #'])('%s', async (kind) => {
        expect(
          await changelog.getReleaseLine(
            ...getChangeset(
              `${keyword}: ${kind === 'with #' ? '#' : ''}${data.pull}`,
              commitFromChangeset
            )
          )
        ).toEqual(`\n- something ([#1613](https://github.com/hey-api/openapi-ts/pull/1613)) ([\`a085003\`](https://github.com/hey-api/openapi-ts/commit/a085003)) by [@someone](https://github.com/someone)`);
      });
    });

    it('override commit with commit keyword', async () => {
      expect(
        await changelog.getReleaseLine(...getChangeset(`commit: ${data.commit}`, commitFromChangeset))
      ).toEqual(`\n- something ([#1613](https://github.com/hey-api/openapi-ts/pull/1613)) ([\`a085003\`](https://github.com/hey-api/openapi-ts/commit/a085003)) by [@someone](https://github.com/someone)`);
    });
  });
});
