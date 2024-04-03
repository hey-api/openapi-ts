# Contributing to OpenAPI TypeScript 👋

Thank you for considering contributing to this project!

> ⚠️ We are currently looking for core maintainers to expand our team. If you're interested in contributing regularly, please reach out to us.

## Development Requirements

- [git](https://git-scm.com/)
- [node](https://nodejs.org/en) (version `18.0` or higher)
- [pnpm](https://pnpm.io/) (version `8` or higher)

## Setting up for Development

For this project we use PNPM as our package manager. You can setup and install all dependencies running the following commands:

```sh
# Install all dependencies
pnpm install
```

## Pull Request Guidelines

If you are unfamiliar with GitHub Pull Requests, please read the following documentation:
https://help.github.com/articles/using-pull-requests

**Your Pull Request must:**

-   Address a single issue or add a single item of functionality.
-   Contain a clean history of small, incremental, logically separate commits, with no merge commits.
-   Use clear commit messages.
-   Be possible to merge automatically.

## Submitting a Pull Request

1. Make your changes in a new git branch: `git checkout -b my-fix-branch main`
2. Create your patch or feature
3. Ensure the builds work by running: `pnpm build`
4. Ensure the tests will pass by running: `pnpm test`
5. Ensure the code is formatted by running: `pnpm lint:fix`
6. Ensure that you create a changeset if required by running: `pnpm changeset`
7. Commit your changes using a descriptive commit message

After your Pull Request is created, it will automatically be build and tested in GitHub actions. Once successful it will be ready for review.
