export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow longer commit messages for detailed explanations
    'body-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    // Allow these conventional commit types
    'type-enum': [
      2,
      'always',
      [
        'build', // Changes that affect the build system or external dependencies
        'chore', // Maintenance tasks, tooling, housekeeping
        'ci', // Changes to CI configuration files and scripts
        'docs', // Documentation only changes
        'feat', // A new feature
        'fix', // A bug fix
        'perf', // A code change that improves performance
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'revert', // Reverts a previous commit
        'style', // Changes that do not affect the meaning of the code
        'test', // Adding missing tests or correcting existing tests
      ],
    ],
  },
};
